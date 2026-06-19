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
use crate::blog::use_case::BlogUseCase;

/// `Cache-Control` for mutable objects (JSON indices, feeds, OGP covers): the
/// browser revalidates, the CDN holds it for a year and is invalidated on each
/// publish.
const CACHE_CONTROL_DYNAMIC: &str = "public, max-age=0, s-maxage=31536000";

/// `Cache-Control` for immutable, content-addressed objects (block images).
const CACHE_CONTROL_IMMUTABLE: &str =
    "public, max-age=31536000, s-maxage=31536000, immutable";

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

/// Summary of a rebuild run, returned to the invoker for observability.
#[derive(Debug, Default, serde::Serialize)]
pub struct RebuildSummary {
    /// Number of languages rebuilt.
    pub languages: usize,
    /// Number of blogs found in the (last) language index.
    pub blogs: usize,
    /// Number of per-slug content objects written (across all languages).
    pub contents: usize,
    /// Number of tags written.
    pub tags: usize,
    /// Number of OGP image objects written (one per slug/language with a cover).
    pub og_images: usize,
    /// Number of block-image variant objects written (across all contents).
    pub block_images: usize,
    /// Total number of S3 objects written.
    pub objects_written: usize,
    /// CloudFront invalidation id created after the rebuild.
    pub invalidation_id: Option<String>,
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
}

/// Rebuilds the entire blog cache from the current Notion state.
///
/// Object layout (keys mirror the eventual public URL paths so a later phase can
/// flip CloudFront to an S3 origin without changing keys):
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

    for language in [BlogLanguageEntity::En, BlogLanguageEntity::Ja] {
        let lang = language.to_string();

        // list (index) # ---------- #
        let blogs = use_case.list_blogs(language.clone()).await?;
        let list: Vec<BlogResponse> = blogs.iter().cloned().map(BlogResponse::from).collect();
        storage
            .put_json(&format!("cache/v2/blog/list/{lang}.json"), &list)
            .await?;
        summary.objects_written += 1;
        summary.blogs = list.len();

        // contents (one per slug) # ---------- #
        for blog in &blogs {
            let contents = use_case
                .get_blog_contents(&blog.slug, language.clone())
                .await?;

            // Collect block-image references before the entity is consumed by
            // the response conversion below.
            let mut refs = Vec::new();
            collect_block_image_refs(&contents.components, &mut refs);

            let response = BlogContentsResponse::from(contents);
            storage
                .put_json(
                    &format!("cache/v2/blog/article/{}/contents/{lang}.json", blog.slug),
                    &response,
                )
                .await?;
            summary.objects_written += 1;
            summary.contents += 1;

            // Materialize every block-image variant this content links to.
            let written = materialize_block_images(&use_case, &storage, &refs).await;
            summary.objects_written += written;
            summary.block_images += written;
        }

        // og images (one per slug with a cover) # ---------- #
        for blog in &blogs {
            let Some(cover_url) = blog.ogp_image_s3_signed_url.as_deref() else {
                continue;
            };
            let written =
                materialize_og_image(&use_case, &storage, &blog.slug, &lang, cover_url).await;
            summary.objects_written += written;
            summary.og_images += written;
        }

        // feeds # ---------- #
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
        summary.objects_written += 3;
        summary.languages += 1;
    }

    // tags (language-agnostic) # ---------- #
    let tags: Vec<BlogTagResponse> = use_case
        .list_tags()
        .await?
        .into_iter()
        .map(BlogTagResponse::from)
        .collect();
    storage.put_json("cache/v2/blog/tags.json", &tags).await?;
    summary.tags = tags.len();
    summary.objects_written += 1;

    // sitemap # ---------- #
    storage
        .put_text(
            "cache/v2/blog/sitemap.xml",
            use_case.generate_sitemap().await?,
            "application/xml",
        )
        .await?;
    summary.objects_written += 1;

    // invalidate the CDN so the freshly published rebuild goes live # ---------- #
    summary.invalidation_id = Some(invalidate_cdn().await?);

    tracing::info!(?summary, "blog cache rebuild complete");
    Ok(summary)
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

/// Issues a targeted CloudFront invalidation (`/cache/v2/blog/*`) so a freshly
/// published rebuild goes live without a manual `/*` invalidation.
///
/// The distribution id is injected by Terraform via the `CLOUDFRONT_DISTRIBUTION_ID`
/// environment variable. The invalidation is created asynchronously by CloudFront;
/// this returns as soon as the request is accepted.
#[cfg_attr(not(rust_analyzer), tracing::instrument(err))]
async fn invalidate_cdn() -> Result<String, PublisherError> {
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

    let paths = aws_sdk_cloudfront::types::Paths::builder()
        .quantity(1)
        .items("/cache/v2/blog/*")
        .build()
        .map_err(|e| PublisherError::CloudFront {
            trace: e.to_string(),
        })?;

    let batch = aws_sdk_cloudfront::types::InvalidationBatch::builder()
        .caller_reference(caller_reference)
        .paths(paths)
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

    tracing::info!(invalidation_id, "created CloudFront invalidation for /cache/v2/blog/*");
    Ok(invalidation_id)
}
