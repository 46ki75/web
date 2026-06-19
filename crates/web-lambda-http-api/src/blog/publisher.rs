//! Blog cache publisher (write side of the read-through cache).
//!
//! Reads the current blog state from Notion and materializes it as static JSON
//! (and XML feeds / sitemap) into the blog-cache S3 bucket. The read path serves
//! these objects instead of calling the (slow) Notion API on every cache miss.
//!
//! The rebuild is **idempotent**: it always reflects the current Notion state,
//! so it is safe to invoke from any trigger (manual invoke, schedule, Notion
//! webhook) and safe to retry.

use std::sync::Arc;

use crate::blog::controller::response::{BlogContentsResponse, BlogResponse, BlogTagResponse};
use crate::blog::repository::BlogRepositoryImpl;
use crate::blog::use_case::input::BlogLanguageEntity;
use crate::blog::use_case::output::BlogEntity;
use crate::blog::use_case::BlogUseCase;

/// `Cache-Control` for mutable objects (JSON indices, feeds, OGP covers): the
/// browser revalidates, the CDN holds it for a year and is invalidated on each
/// publish.
const CACHE_CONTROL_DYNAMIC: &str = "public, max-age=0, s-maxage=31536000";

/// `Cache-Control` for immutable, content-addressed objects (block images).
const CACHE_CONTROL_IMMUTABLE: &str =
    "public, max-age=31536000, s-maxage=31536000, immutable";

/// Internal object tracking the published `updated_at` per (language, slug).
///
/// Stored in the blog-cache bucket but *outside* the `cache/` prefix, so no
/// CloudFront behavior routes to it and it is never publicly served. The
/// incremental publisher diffs live Notion `updated_at` values against this to
/// decide what to (re)build, skip, or prune.
const MANIFEST_KEY: &str = "internal/blog-publisher/manifest.json";

#[derive(Debug, thiserror::Error)]
pub enum PublisherError {
    #[error(transparent)]
    UseCase(#[from] crate::blog::use_case::BlogUseCaseError),

    #[error("JSON serialization error: {0}")]
    SerdeJson(#[from] serde_json::Error),

    #[error("S3 error for key '{key}': {trace}")]
    S3 { key: String, trace: String },

    #[error("CloudFront invalidation failed: {trace}")]
    CloudFront { trace: String },

    /// Wraps shared infrastructure failures (environment variables) that have
    /// no additional business meaning at this layer.
    #[error(transparent)]
    Internal(#[from] crate::error::Error),
}

/// Summary of an incremental rebuild run, returned to the invoker and emitted
/// to logs for observability.
#[derive(Debug, Default, serde::Serialize)]
pub struct RebuildSummary {
    /// Languages scanned.
    pub languages: usize,
    /// (slug, language) pairs scanned across all languages.
    pub blogs_scanned: usize,
    /// Newly published entries, formatted as `"{lang}/{slug}"`.
    pub added: Vec<String>,
    /// Republished entries whose `updated_at` changed, as `"{lang}/{slug}"`.
    pub updated: Vec<String>,
    /// Entries skipped because their `updated_at` was unchanged.
    pub unchanged: usize,
    /// Entries pruned because the slug disappeared from Notion, as `"{lang}/{slug}"`.
    pub removed: Vec<String>,
    /// S3 objects written this run.
    pub objects_written: usize,
    /// S3 objects deleted this run (pruned article objects).
    pub objects_pruned: usize,
    /// Block-image variant objects (re)written.
    pub block_images: usize,
    /// OGP cover objects (re)written.
    pub og_images: usize,
    /// Whether collection objects (list/feeds/tags/sitemap) were regenerated.
    pub collection_regenerated: bool,
    /// CloudFront paths invalidated (empty when nothing changed).
    pub invalidated_paths: Vec<String>,
    /// CloudFront invalidation id (`None` when nothing changed).
    pub invalidation_id: Option<String>,
}

/// Published-state manifest: `language -> (slug -> published updated_at)`.
///
/// `BTreeMap` keeps the serialized form stable (deterministic key order) so the
/// stored object only changes when the tracked versions actually change.
#[derive(Debug, Default, serde::Serialize, serde::Deserialize)]
struct Manifest {
    #[serde(default)]
    blogs: std::collections::BTreeMap<String, std::collections::BTreeMap<String, String>>,
}

/// A block-image reference discovered while walking rendered content.
struct BlockImageRef {
    /// Notion block id (the `image.id` from the rendered component).
    block_id: String,
    /// Whether the source is an SVG (resolution-independent → single variant).
    is_svg: bool,
}

/// S3-backed storage for the materialized blog cache.
#[derive(Clone)]
pub struct S3BlogStorage {
    client: &'static aws_sdk_s3::Client,
    bucket: String,
}

impl S3BlogStorage {
    /// Resolves the per-stage bucket name and the cached S3 client.
    pub async fn new() -> Result<Self, crate::error::Error> {
        let stage_name = crate::stage_name()?;
        let bucket = format!("{stage_name}-46ki75-web-s3-bucket-blog-cache");
        let client = crate::once_cell_cache::s3_client::init_s3_client().await;
        Ok(Self { client, bucket })
    }

    /// Fetches an object's bytes, returning `None` when the key does not exist.
    pub async fn get(&self, key: &str) -> Result<Option<bytes::Bytes>, PublisherError> {
        Ok(self.get_object(key).await?.map(|(bytes, _)| bytes))
    }

    /// Fetches an object's bytes together with its stored `Content-Type`,
    /// returning `None` when the key does not exist.
    ///
    /// The content type is preserved from publish time so the read path (and a
    /// later CloudFront → S3 origin) can echo it without re-inferring.
    #[cfg_attr(not(rust_analyzer), tracing::instrument(skip(self)))]
    pub async fn get_object(
        &self,
        key: &str,
    ) -> Result<Option<(bytes::Bytes, Option<String>)>, PublisherError> {
        match self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
        {
            Ok(output) => {
                let content_type = output.content_type().map(|s| s.to_owned());
                let data = output.body.collect().await.map_err(|e| PublisherError::S3 {
                    key: key.to_owned(),
                    trace: e.to_string(),
                })?;
                Ok(Some((data.into_bytes(), content_type)))
            }
            Err(e) => {
                let service_error = e.into_service_error();
                if service_error.is_no_such_key() {
                    Ok(None)
                } else {
                    Err(PublisherError::S3 {
                        key: key.to_owned(),
                        trace: aws_sdk_s3::error::DisplayErrorContext(&service_error).to_string(),
                    })
                }
            }
        }
    }

    #[cfg_attr(not(rust_analyzer), tracing::instrument(skip(self, body), err))]
    async fn put(
        &self,
        key: &str,
        body: Vec<u8>,
        content_type: &str,
        cache_control: &str,
    ) -> Result<(), PublisherError> {
        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .body(body.into())
            .content_type(content_type)
            .cache_control(cache_control)
            .send()
            .await
            .map_err(|e| PublisherError::S3 {
                key: key.to_owned(),
                trace: aws_sdk_s3::error::DisplayErrorContext(&e).to_string(),
            })?;
        tracing::debug!(key, "wrote object to blog cache");
        Ok(())
    }

    /// Serializes `value` as JSON and writes it with `application/json`.
    pub async fn put_json<T: serde::Serialize>(
        &self,
        key: &str,
        value: &T,
    ) -> Result<(), PublisherError> {
        let body = serde_json::to_vec(value)?;
        self.put(key, body, "application/json", CACHE_CONTROL_DYNAMIC)
            .await
    }

    /// Writes a pre-rendered text body (XML/JSON) with the given content type.
    pub async fn put_text(
        &self,
        key: &str,
        body: String,
        content_type: &str,
    ) -> Result<(), PublisherError> {
        self.put(key, body.into_bytes(), content_type, CACHE_CONTROL_DYNAMIC)
            .await
    }

    /// Deletes an object. Succeeds even when the key is already absent (S3
    /// `DeleteObject` is idempotent), so pruning never fails on a missing key.
    #[cfg_attr(not(rust_analyzer), tracing::instrument(skip(self), err))]
    pub async fn delete(&self, key: &str) -> Result<(), PublisherError> {
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| PublisherError::S3 {
                key: key.to_owned(),
                trace: aws_sdk_s3::error::DisplayErrorContext(&e).to_string(),
            })?;
        tracing::debug!(key, "deleted object from blog cache");
        Ok(())
    }

    /// Loads the publish manifest, returning an empty one when it is absent or
    /// unreadable. An empty manifest forces a full rebuild — the safe default.
    async fn load_manifest(&self) -> Manifest {
        match self.get(MANIFEST_KEY).await {
            Ok(Some(bytes)) => serde_json::from_slice(&bytes).unwrap_or_else(|e| {
                tracing::warn!(error = %e, "manifest unparseable; treating as empty (full rebuild)");
                Manifest::default()
            }),
            Ok(None) => Manifest::default(),
            Err(e) => {
                tracing::warn!(error = %e, "manifest read failed; treating as empty (full rebuild)");
                Manifest::default()
            }
        }
    }

    /// Persists the publish manifest.
    async fn save_manifest(&self, manifest: &Manifest) -> Result<(), PublisherError> {
        self.put_json(MANIFEST_KEY, manifest).await
    }
}

/// Incrementally rebuilds the blog cache from the current Notion state.
///
/// The publisher lists blogs from Notion (slug + `updated_at` version), diffs
/// each against the [`Manifest`] of what was last published, and only does work
/// for what changed:
///
/// * **added / updated** (no manifest entry, or a different `updated_at`) →
///   rebuild that article's content + block images + OGP cover;
/// * **unchanged** (same `updated_at`) → skip entirely (no Notion content fetch,
///   no image conversion);
/// * **removed** (gone from Notion) → prune that article's objects.
///
/// Collection objects (list / feeds / tags / sitemap) are regenerated only when
/// something changed, and the CDN invalidation is targeted at exactly the paths
/// touched. A run where nothing changed writes nothing and invalidates nothing.
///
/// Object layout:
///
/// ```text
/// cache/v2/blog/list/{en|ja}.json
/// cache/v2/blog/tags.json
/// cache/v2/blog/feed/{rss|atom|json-feed}/{en|ja}.{xml|json}
/// cache/v2/blog/sitemap.xml
/// cache/v2/blog/article/{slug}/contents/{en|ja}.json
/// cache/v2/blog/article/{slug}/og-image/{en|ja}
/// cache/v2/blog/block-image/{block_id}/{default|small|medium|large}
/// ```
#[cfg_attr(not(rust_analyzer), tracing::instrument(err))]
pub async fn rebuild_cache() -> Result<RebuildSummary, PublisherError> {
    let use_case = BlogUseCase {
        blog_repository: Arc::new(BlogRepositoryImpl {}),
    };
    let storage = S3BlogStorage::new().await?;

    let mut summary = RebuildSummary::default();
    let mut manifest = storage.load_manifest().await;

    // Slugs whose article objects changed (added/updated/removed). Article paths
    // are language-agnostic, so one entry covers both languages for invalidation.
    let mut changed_slugs: std::collections::BTreeSet<String> = Default::default();
    // Languages whose blog set/metadata changed → drives list/feed regeneration.
    let mut changed_langs: std::collections::BTreeSet<String> = Default::default();
    // Each language's live blog list, reused when regenerating the index below.
    let mut blogs_by_lang: std::collections::BTreeMap<String, Vec<BlogEntity>> = Default::default();

    for language in [BlogLanguageEntity::En, BlogLanguageEntity::Ja] {
        let lang = language.to_string();
        summary.languages += 1;

        let blogs = use_case.list_blogs(language.clone()).await?;
        summary.blogs_scanned += blogs.len();

        let published = manifest.blogs.entry(lang.clone()).or_default();
        let live_slugs: std::collections::BTreeSet<String> =
            blogs.iter().map(|b| b.slug.clone()).collect();

        for blog in &blogs {
            let version = version_of(blog);

            match published.get(&blog.slug) {
                Some(prev) if *prev == version => {
                    summary.unchanged += 1;
                    tracing::debug!(slug = %blog.slug, %lang, "unchanged; skipping");
                    continue;
                }
                Some(_) => {
                    tracing::info!(slug = %blog.slug, %lang, "updated_at changed; republishing");
                    summary.updated.push(format!("{lang}/{}", blog.slug));
                }
                None => {
                    tracing::info!(slug = %blog.slug, %lang, "new blog; publishing");
                    summary.added.push(format!("{lang}/{}", blog.slug));
                }
            }

            let written = rebuild_article(&use_case, &storage, blog, language.clone(), &lang).await?;
            summary.objects_written += written.objects;
            summary.block_images += written.block_images;
            summary.og_images += written.og_images;

            published.insert(blog.slug.clone(), version);
            changed_slugs.insert(blog.slug.clone());
            changed_langs.insert(lang.clone());
        }

        // Prune slugs that vanished from Notion. (Block-image variants they
        // referenced are content-addressed and immutable; without the old
        // content we can't know their ids, so they're left as harmless orphans.)
        let removed: Vec<String> = published
            .keys()
            .filter(|slug| !live_slugs.contains(*slug))
            .cloned()
            .collect();
        for slug in removed {
            tracing::info!(%slug, %lang, "removed from Notion; pruning article objects");
            summary.objects_pruned += prune_article(&storage, &slug, &lang).await;
            summary.removed.push(format!("{lang}/{slug}"));
            published.remove(&slug);
            changed_slugs.insert(slug.clone());
            changed_langs.insert(lang.clone());
        }

        blogs_by_lang.insert(lang, blogs);
    }

    // Nothing changed → leave the cache and manifest untouched.
    if changed_slugs.is_empty() {
        tracing::info!(?summary, "blog cache already up to date; nothing to publish");
        return Ok(summary);
    }

    // Collection objects depend on the blog set/metadata; regenerate the index
    // and feeds for each changed language.
    for language in [BlogLanguageEntity::En, BlogLanguageEntity::Ja] {
        let lang = language.to_string();
        if !changed_langs.contains(&lang) {
            continue;
        }

        let blogs = &blogs_by_lang[&lang];
        let list: Vec<BlogResponse> = blogs.iter().cloned().map(BlogResponse::from).collect();
        storage
            .put_json(&format!("cache/v2/blog/list/{lang}.json"), &list)
            .await?;
        storage
            .put_text(
                &format!("cache/v2/blog/feed/rss/{lang}.xml"),
                use_case.generate_rss(language.clone()).await?,
                "application/xml",
            )
            .await?;
        storage
            .put_text(
                &format!("cache/v2/blog/feed/atom/{lang}.xml"),
                use_case.generate_atom(language.clone()).await?,
                "application/xml",
            )
            .await?;
        storage
            .put_text(
                &format!("cache/v2/blog/feed/json-feed/{lang}.json"),
                use_case.generate_jsonfeed(language.clone()).await?,
                "application/json",
            )
            .await?;
        summary.objects_written += 4;
    }

    // tags + sitemap span all languages, so regenerate them on any change.
    let tags: Vec<BlogTagResponse> = use_case
        .list_tags()
        .await?
        .into_iter()
        .map(BlogTagResponse::from)
        .collect();
    storage.put_json("cache/v2/blog/tags.json", &tags).await?;
    storage
        .put_text(
            "cache/v2/blog/sitemap.xml",
            use_case.generate_sitemap().await?,
            "application/xml",
        )
        .await?;
    summary.objects_written += 2;
    summary.collection_regenerated = true;

    // Record the new published versions before invalidating.
    storage.save_manifest(&manifest).await?;

    // Targeted invalidation of only the paths this run touched.
    let mut paths: Vec<String> = changed_slugs
        .iter()
        .map(|slug| format!("/cache/v2/blog/article/{slug}/*"))
        .collect();
    for lang in &changed_langs {
        paths.push(format!("/cache/v2/blog/list/{lang}.json"));
    }
    paths.push("/cache/v2/blog/feed/*".to_owned());
    paths.push("/cache/v2/blog/tags.json".to_owned());
    paths.push("/cache/v2/blog/sitemap.xml".to_owned());

    summary.invalidation_id = Some(invalidate_cdn(&paths).await?);
    summary.invalidated_paths = paths;

    tracing::info!(?summary, "blog cache rebuild complete");
    Ok(summary)
}

/// Objects (re)written while rebuilding a single article.
struct ArticleWrite {
    /// Total objects written (contents + block images + OGP cover).
    objects: usize,
    /// Block-image variant objects written.
    block_images: usize,
    /// OGP cover objects written (0 or 1).
    og_images: usize,
}

/// (Re)builds one article: rendered contents JSON, every block-image variant it
/// links to, and its OGP cover. Image failures are non-fatal (logged + skipped).
async fn rebuild_article(
    use_case: &BlogUseCase,
    storage: &S3BlogStorage,
    blog: &BlogEntity,
    language: BlogLanguageEntity,
    lang: &str,
) -> Result<ArticleWrite, PublisherError> {
    let contents = use_case.get_blog_contents(&blog.slug, language).await?;

    // Collect block-image references before the entity is consumed below.
    let mut refs = Vec::new();
    collect_block_image_refs(&contents.components, &mut refs);

    let response = BlogContentsResponse::from(contents);
    storage
        .put_json(
            &format!("cache/v2/blog/article/{}/contents/{lang}.json", blog.slug),
            &response,
        )
        .await?;

    let block_images = materialize_block_images(use_case, storage, &refs).await;

    let og_images = match blog.ogp_image_s3_signed_url.as_deref() {
        Some(cover_url) => {
            materialize_og_image(use_case, storage, &blog.slug, lang, cover_url).await
        }
        None => 0,
    };

    Ok(ArticleWrite {
        objects: 1 + block_images + og_images,
        block_images,
        og_images,
    })
}

/// Deletes a removed article's per-language objects. Returns the number deleted.
async fn prune_article(storage: &S3BlogStorage, slug: &str, lang: &str) -> usize {
    let keys = [
        format!("cache/v2/blog/article/{slug}/contents/{lang}.json"),
        format!("cache/v2/blog/article/{slug}/og-image/{lang}"),
    ];
    let mut pruned = 0;
    for key in keys {
        match storage.delete(&key).await {
            Ok(()) => pruned += 1,
            Err(e) => tracing::warn!(key, error = %e, "failed to prune article object"),
        }
    }
    pruned
}

/// The version a blog is tracked by: its manual Notion `updated_at`, as RFC3339.
/// Bumping `updated_at` in Notion is what marks a post ready to (re)publish.
fn version_of(blog: &BlogEntity) -> String {
    blog.updated_at
        .format(&time::format_description::well_known::Rfc3339)
        .unwrap_or_else(|_| blog.updated_at.unix_timestamp().to_string())
}

/// Recursively collects block-image references from rendered content so the
/// publisher can materialize exactly the variants the content links to.
///
/// Mirrors the container recursion in [`BlogUseCase::rewrite_components`];
/// images only ever appear as block components, so inline slots are skipped.
fn collect_block_image_refs(components: &[jarkup_rs::Component], out: &mut Vec<BlockImageRef>) {
    for component in components {
        let jarkup_rs::Component::BlockComponent(block) = component else {
            continue;
        };
        match block {
            jarkup_rs::BlockComponent::Image(image) => {
                if let Some(id) = &image.id {
                    let is_svg = image
                        .props
                        .mime_type
                        .as_ref()
                        .map(|mime| mime.contains("xml"))
                        .unwrap_or(false);
                    out.push(BlockImageRef {
                        block_id: id.clone(),
                        is_svg,
                    });
                }
            }
            jarkup_rs::BlockComponent::Fragment(fragment) => {
                collect_block_image_refs(&fragment.slots.default, out)
            }
            jarkup_rs::BlockComponent::ListItem(list_item) => {
                collect_block_image_refs(&list_item.slots.default, out)
            }
            jarkup_rs::BlockComponent::List(list) => {
                collect_block_image_refs(&list.slots.default, out)
            }
            jarkup_rs::BlockComponent::BlockQuote(block_quote) => {
                collect_block_image_refs(&block_quote.slots.default, out)
            }
            jarkup_rs::BlockComponent::Callout(callout) => {
                collect_block_image_refs(&callout.slots.default, out)
            }
            jarkup_rs::BlockComponent::Toggle(toggle) => {
                collect_block_image_refs(&toggle.slots.default, out)
            }
            jarkup_rs::BlockComponent::Tab(tab) => {
                collect_block_image_refs(&tab.slots.contents, out)
            }
            jarkup_rs::BlockComponent::Tabs(tabs) => {
                collect_block_image_refs(&tabs.slots.default, out)
            }
            jarkup_rs::BlockComponent::Table(table) => {
                collect_block_image_refs(&table.slots.body, out);
                if let Some(header) = &table.slots.header {
                    collect_block_image_refs(header, out);
                }
            }
            jarkup_rs::BlockComponent::TableRow(table_row) => {
                collect_block_image_refs(&table_row.slots.default, out)
            }
            jarkup_rs::BlockComponent::ColumnList(column_list) => {
                collect_block_image_refs(&column_list.slots.default, out)
            }
            jarkup_rs::BlockComponent::Column(column) => {
                collect_block_image_refs(&column.slots.default, out)
            }
            _ => {}
        }
    }
}

/// Fetches, converts and writes every variant of each referenced block image.
///
/// Failures are **non-fatal**: a single broken image is logged and skipped so a
/// transient fetch/convert error does not abort the whole republish. Returns the
/// number of variant objects written.
async fn materialize_block_images(
    use_case: &BlogUseCase,
    storage: &S3BlogStorage,
    refs: &[BlockImageRef],
) -> usize {
    let mut written = 0;
    let mut seen = std::collections::HashSet::new();

    for image in refs {
        if !seen.insert(image.block_id.as_str()) {
            continue;
        }

        let source = match use_case.fetch_block_image_by_id(&image.block_id).await {
            Ok(bytes) => bytes,
            Err(e) => {
                tracing::warn!(block_id = %image.block_id, error = %e, "skipping block image: fetch failed");
                continue;
            }
        };

        // SVG is resolution-independent, so the rendered content links only the
        // base (`default`) variant; raster images expose the full srcset set.
        let variants: &[(&str, Option<u32>)] = if image.is_svg {
            &[("default", None)]
        } else {
            &[
                ("default", None),
                ("small", Some(500)),
                ("medium", Some(800)),
                ("large", Some(1200)),
            ]
        };

        for (variant, width) in variants.iter().copied() {
            let converted = match use_case.convert_image(&source, width) {
                Ok(bytes) => bytes,
                Err(e) => {
                    tracing::warn!(block_id = %image.block_id, variant, error = %e, "skipping block image variant: convert failed");
                    continue;
                }
            };
            let content_type = use_case.infer_image_mime_type(&converted);
            let key = format!("cache/v2/blog/block-image/{}/{}", image.block_id, variant);
            if let Err(e) = storage
                .put(&key, converted.to_vec(), &content_type, CACHE_CONTROL_IMMUTABLE)
                .await
            {
                tracing::warn!(key, error = %e, "skipping block image variant: put failed");
                continue;
            }
            written += 1;
        }
    }

    written
}

/// Fetches, converts and writes a blog's OGP cover image. Non-fatal: a failure
/// is logged and skipped (the read path then 404s for that cover). Returns the
/// number of objects written (0 or 1).
async fn materialize_og_image(
    use_case: &BlogUseCase,
    storage: &S3BlogStorage,
    slug: &str,
    lang: &str,
    cover_url: &str,
) -> usize {
    let source = match use_case.blog_repository.fetch_image_by_url(cover_url).await {
        Ok(bytes) => bytes,
        Err(e) => {
            tracing::warn!(slug, lang, error = %e, "skipping og image: fetch failed");
            return 0;
        }
    };
    let converted = match use_case.convert_image(&source, Some(1200)) {
        Ok(bytes) => bytes,
        Err(e) => {
            tracing::warn!(slug, lang, error = %e, "skipping og image: convert failed");
            return 0;
        }
    };
    let content_type = use_case.infer_image_mime_type(&converted);
    let key = format!("cache/v2/blog/article/{slug}/og-image/{lang}");
    if let Err(e) = storage
        .put(&key, converted.to_vec(), &content_type, CACHE_CONTROL_DYNAMIC)
        .await
    {
        tracing::warn!(key, error = %e, "skipping og image: put failed");
        return 0;
    }
    1
}

/// Issues a CloudFront invalidation for the given paths so a freshly published
/// rebuild goes live. Callers pass only the paths that actually changed.
///
/// The distribution id is injected by Terraform via the `CLOUDFRONT_DISTRIBUTION_ID`
/// environment variable. The invalidation is created asynchronously by CloudFront;
/// this returns as soon as the request is accepted.
#[cfg_attr(not(rust_analyzer), tracing::instrument(err))]
async fn invalidate_cdn(paths: &[String]) -> Result<String, PublisherError> {
    let distribution_id = std::env::var("CLOUDFRONT_DISTRIBUTION_ID").map_err(|_| {
        crate::error::Error::EnvironmentVariableNotFound {
            variable_name: "CLOUDFRONT_DISTRIBUTION_ID".to_owned(),
        }
    })?;

    let client = crate::once_cell_cache::cloudfront_client::init_cloudfront_client().await;

    // CloudFront requires a unique caller reference per request.
    let caller_reference = format!(
        "blog-publisher-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0)
    );

    let mut paths_builder = aws_sdk_cloudfront::types::Paths::builder().quantity(paths.len() as i32);
    for path in paths {
        paths_builder = paths_builder.items(path);
    }
    let paths_obj = paths_builder
        .build()
        .map_err(|e| PublisherError::CloudFront {
            trace: e.to_string(),
        })?;

    let batch = aws_sdk_cloudfront::types::InvalidationBatch::builder()
        .caller_reference(caller_reference)
        .paths(paths_obj)
        .build()
        .map_err(|e| PublisherError::CloudFront {
            trace: e.to_string(),
        })?;

    let output = client
        .create_invalidation()
        .distribution_id(distribution_id)
        .invalidation_batch(batch)
        .send()
        .await
        .map_err(|e| PublisherError::CloudFront {
            trace: aws_sdk_cloudfront::error::DisplayErrorContext(&e).to_string(),
        })?;

    let invalidation_id = output.invalidation.map(|i| i.id).unwrap_or_default();

    tracing::info!(invalidation_id, count = paths.len(), "created CloudFront invalidation");
    Ok(invalidation_id)
}
