use image::GenericImageView;

pub mod input;
pub mod output;

/// Errors produced by the blog use-case layer.
///
/// Semantic outcomes — a blog not being found, an OGP cover not being configured —
/// are expressed as first-class variants so the controller can map them to the
/// correct HTTP status codes.  Genuinely opaque failures (XML serialisation,
/// image processing, I/O) propagate transparently.
#[derive(Debug, thiserror::Error)]
pub enum BlogUseCaseError {
    #[error("blog '{0}' not found")]
    NotFound(String),

    #[error("OGP cover image is not set for page '{page_id}'")]
    OgpCoverNotSet { page_id: String },

    #[error("XML serialization error: {0}")]
    SerializeXml(#[from] quick_xml::SeError),

    #[error("image conversion error: {0}")]
    ImageConversion(#[from] image::ImageError),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON serialization error: {0}")]
    SerdeJson(#[from] serde_json::Error),

    #[error("time error: {0}")]
    Time(#[from] time::Error),

    /// Wraps shared infrastructure failures (environment variables) that have
    /// no additional business meaning at this layer.
    #[error(transparent)]
    Internal(#[from] crate::error::Error),

    #[error(transparent)]
    Repository(#[from] super::repository::BlogRepositoryError),
}

#[derive(Clone)]
pub struct BlogUseCase {
    pub blog_repository: std::sync::Arc<dyn super::repository::BlogRepository + Send + Sync>,
}

impl BlogUseCase {
    #[tracing::instrument(skip(self), err)]
    pub async fn list_blogs(
        &self,
        language: input::BlogLanguageEntity,
    ) -> Result<Vec<output::BlogEntity>, BlogUseCaseError> {
        let language = match language {
            input::BlogLanguageEntity::En => super::repository::input::BlogLanguageDto::En,
            input::BlogLanguageEntity::Ja => super::repository::input::BlogLanguageDto::Ja,
        };

        let blog_dtoes = self.blog_repository.list_blogs(language).await?;

        let blog_entities = blog_dtoes
            .into_iter()
            .map(|dto| output::BlogEntity::from(dto))
            .collect::<Vec<output::BlogEntity>>();

        Ok(blog_entities)
    }

    #[tracing::instrument(skip(self), err)]
    pub async fn get_blog_by_slug(
        &self,
        slug: &str,
        language: input::BlogLanguageEntity,
    ) -> Result<output::BlogEntity, BlogUseCaseError> {
        let language = match language {
            input::BlogLanguageEntity::En => super::repository::input::BlogLanguageDto::En,
            input::BlogLanguageEntity::Ja => super::repository::input::BlogLanguageDto::Ja,
        };

        let blog_dtoes = self.blog_repository.list_blogs(language).await?;

        let blog_dto = blog_dtoes
            .into_iter()
            .find(|blog| blog.slug == slug)
            .ok_or_else(|| BlogUseCaseError::NotFound(slug.to_owned()))?;

        Ok(blog_dto.into())
    }

    #[tracing::instrument(skip(self), err)]
    pub async fn get_blog_contents(
        &self,
        slug: &str,
        language: input::BlogLanguageEntity,
    ) -> Result<output::BlogContentsEntity, BlogUseCaseError> {
        let blog = self.get_blog_by_slug(slug, language.clone()).await?;

        let language = match language {
            input::BlogLanguageEntity::En => super::repository::input::BlogLanguageDto::En,
            input::BlogLanguageEntity::Ja => super::repository::input::BlogLanguageDto::Ja,
        };

        let mut components = self
            .blog_repository
            .get_blog_contents(slug, language)
            .await?;

        Self::rewrite_components(&mut components);

        Ok(output::BlogContentsEntity {
            meta: blog,
            components,
        })
    }

    #[tracing::instrument(skip(self), err)]
    pub async fn list_tags(&self) -> Result<Vec<output::BlogTagEntity>, BlogUseCaseError> {
        let tag_dtos = self.blog_repository.list_tags().await?;
        let tags = tag_dtos
            .into_iter()
            .map(|tag| output::BlogTagEntity::from(tag))
            .collect::<Vec<output::BlogTagEntity>>();

        Ok(tags)
    }

    #[tracing::instrument]
    fn rewrite_inline_component(_inline_component: &mut jarkup_rs::InlineComponent) {}

    #[tracing::instrument]
    fn rewrite_inline_components(inline_components: &mut Vec<jarkup_rs::InlineComponent>) {
        for inline_component in inline_components {
            Self::rewrite_inline_component(inline_component);
        }
    }

    #[tracing::instrument]
    fn rewrite_components(components: &mut Vec<jarkup_rs::Component>) {
        for component in components {
            match component {
                jarkup_rs::Component::InlineComponent(inline_component) => {
                    Self::rewrite_inline_component(inline_component);
                }
                jarkup_rs::Component::BlockComponent(block_component) => match block_component {
                    jarkup_rs::BlockComponent::Image(image) => {
                        if let Some(id) = &image.id {
                            let src_base = format!("/api/v2/blog/block-image/{}", id);

                            (image.props.srcset, image.props.sizes) = if image
                                .props
                                .mime_type
                                .as_ref()
                                .map(|mime| mime.contains("xml"))
                                .unwrap_or(false)
                            {
                                // If the image is SVG, we don't set srcset and sizes
                                // because SVG is resolution-independent and can be scaled without loss of quality.
                                (None, None)
                            } else {
                                (
                                Some(
                                    format!(
                                        "{src_base}?size=small 500w, {src_base}?size=medium 800w, {src_base}?size=large 1200w"
                                    )
                                ),
                                Some("(max-width: 800px) 100vw, 800px".to_owned())
                                )
                            };

                            image.props.src = src_base;
                        };
                    }

                    jarkup_rs::BlockComponent::Fragment(fragment) => {
                        Self::rewrite_components(&mut fragment.slots.default);
                    }
                    jarkup_rs::BlockComponent::Heading(heading) => {
                        Self::rewrite_inline_components(&mut heading.slots.default);
                    }
                    jarkup_rs::BlockComponent::Paragraph(paragraph) => {
                        Self::rewrite_inline_components(&mut paragraph.slots.default);
                    }
                    jarkup_rs::BlockComponent::ListItem(list_item) => {
                        Self::rewrite_components(&mut list_item.slots.default);
                    }
                    jarkup_rs::BlockComponent::List(list) => {
                        Self::rewrite_components(&mut list.slots.default);
                    }
                    jarkup_rs::BlockComponent::BlockQuote(block_quote) => {
                        Self::rewrite_components(&mut block_quote.slots.default);
                    }
                    jarkup_rs::BlockComponent::Callout(callout) => {
                        Self::rewrite_components(&mut callout.slots.default);
                    }
                    jarkup_rs::BlockComponent::Divider(..) => {}
                    jarkup_rs::BlockComponent::Toggle(toggle) => {
                        Self::rewrite_inline_components(&mut toggle.slots.summary);
                        Self::rewrite_components(&mut toggle.slots.default);
                    }
                    jarkup_rs::BlockComponent::Bookmark(..) => {}
                    jarkup_rs::BlockComponent::File(..) => {}
                    jarkup_rs::BlockComponent::CodeBlock(code_block) => {
                        if let Some(slots) = &mut code_block.slots {
                            Self::rewrite_inline_components(&mut slots.default);
                        }
                    }
                    jarkup_rs::BlockComponent::Katex(..) => {}
                    jarkup_rs::BlockComponent::Mermaid(..) => {}
                    jarkup_rs::BlockComponent::Tab(tab) => {
                        Self::rewrite_inline_components(&mut tab.slots.labels);
                        Self::rewrite_components(&mut tab.slots.contents);
                    }
                    jarkup_rs::BlockComponent::Tabs(tabs) => {
                        Self::rewrite_components(&mut tabs.slots.default);
                    }
                    jarkup_rs::BlockComponent::Table(table) => {
                        Self::rewrite_components(&mut table.slots.body);
                        if let Some(header) = &mut table.slots.header {
                            Self::rewrite_components(header);
                        }
                    }
                    jarkup_rs::BlockComponent::TableRow(table_row) => {
                        Self::rewrite_components(&mut table_row.slots.default);
                    }
                    jarkup_rs::BlockComponent::TableCell(table_cell) => {
                        Self::rewrite_inline_components(&mut table_cell.slots.default);
                    }
                    jarkup_rs::BlockComponent::ColumnList(column_list) => {
                        Self::rewrite_components(&mut column_list.slots.default);
                    }
                    jarkup_rs::BlockComponent::Column(column) => {
                        Self::rewrite_components(&mut column.slots.default);
                    }
                    jarkup_rs::BlockComponent::Unsupported(..) => {}
                },
            }
        }
    }

    /// Infers the MIME type of the image by its binary data.
    #[tracing::instrument(skip(self))]
    pub fn infer_image_mime_type(&self, image_bytes: &bytes::Bytes) -> String {
        infer::get(&image_bytes)
            .map(|t| {
                let mime_type = t.to_string();
                if mime_type.contains("xml") {
                    // treat XML-based formats (e.g. SVG)
                    // as "application/xml" to distinguish from binary formats
                    "image/svg+xml".to_string()
                } else {
                    mime_type
                }
            })
            .unwrap_or(String::from("application/octet-stream"))
    }

    /// Fetches OGP image binary by its blog page ID.
    #[tracing::instrument(skip(self))]
    pub async fn fetch_ogp_image_by_slug(
        &self,
        slug: &str,
        language: input::BlogLanguageEntity,
    ) -> Result<bytes::Bytes, BlogUseCaseError> {
        let blog = self.get_blog_by_slug(slug, language).await?;

        let ogp_image_s3_signed_url =
            blog.ogp_image_s3_signed_url
                .ok_or_else(|| BlogUseCaseError::OgpCoverNotSet {
                    page_id: blog.page_id,
                })?;

        let image_bytes = self
            .blog_repository
            .fetch_image_by_url(&ogp_image_s3_signed_url)
            .await?;

        Ok(image_bytes)
    }

    /// Fetches image binary of the block by its block ID.
    #[tracing::instrument(skip(self), err)]
    pub async fn fetch_block_image_by_id(
        &self,
        block_id: &str,
    ) -> Result<bytes::Bytes, BlogUseCaseError> {
        let image_bytes = self
            .blog_repository
            .fetch_image_by_block_id(block_id)
            .await?;

        Ok(image_bytes)
    }

    #[tracing::instrument(skip(self), err)]
    pub fn convert_image(
        &self,
        image_bytes: &[u8],
        new_width: Option<u32>,
    ) -> Result<bytes::Bytes, BlogUseCaseError> {
        let mime_type = self.infer_image_mime_type(&bytes::Bytes::copy_from_slice(image_bytes));

        if mime_type.contains("xml") {
            return Ok(bytes::Bytes::copy_from_slice(image_bytes));
        }

        let img = image::ImageReader::new(std::io::Cursor::new(image_bytes))
            .with_guessed_format()?
            .decode()?;

        let img = match new_width {
            Some(new_width) => {
                let (original_width, original_height) = img.dimensions();

                if original_width >= new_width {
                    let new_height = original_height * new_width / original_width;
                    img.resize(new_width, new_height, image::imageops::FilterType::Lanczos3)
                } else {
                    img
                }
            }
            None => img,
        };

        let encoder = webp::Encoder::from_image(&img).unwrap();

        let webp: webp::WebPMemory = encoder.encode(85f32);

        Ok(bytes::Bytes::from(webp.to_vec()))
    }

    #[tracing::instrument(skip(self), err)]
    pub async fn generate_sitemap(&self) -> Result<String, BlogUseCaseError> {
        use strum::IntoEnumIterator;

        let languages: Vec<input::BlogLanguageEntity> = input::BlogLanguageEntity::iter().collect();

        // collect blogs per language
        let mut blogs_by_lang: std::collections::HashMap<String, Vec<output::BlogEntity>> =
            std::collections::HashMap::new();
        for lang in &languages {
            let list = self.list_blogs(lang.clone()).await?;
            blogs_by_lang.insert(lang.to_string(), list);
        }

        let domain = crate::domain_name()?;

        let mut urlset: Vec<output::BlogSitemapUrl> = Vec::new();

        for lang in &languages {
            let lang_key = lang.to_string();
            if let Some(blogs) = blogs_by_lang.get(&lang_key) {
                for blog in blogs {
                    let base_url = match lang {
                        input::BlogLanguageEntity::En => format!("https://{domain}"),
                        _ => format!("https://{domain}/{}", lang.to_string()),
                    };

                    let loc = format!("{base_url}/blog/article/{slug}", slug = blog.slug);

                    // build alternates only when corresponding slug exists in that language
                    let mut alternates: Vec<output::BlogAlternateLink> = Vec::new();
                    for alt_lang in &languages {
                        let alt_key = alt_lang.to_string();
                        if let Some(alt_blogs) = blogs_by_lang.get(&alt_key) {
                            if alt_blogs.iter().any(|b| b.slug == blog.slug) {
                                let alt_base = match alt_lang {
                                    input::BlogLanguageEntity::En => {
                                        format!("https://{domain}")
                                    }
                                    _ => format!("https://{domain}/{}", alt_lang.to_string()),
                                };
                                let href =
                                    format!("{alt_base}/blog/article/{slug}", slug = blog.slug);
                                alternates.push(output::BlogAlternateLink {
                                    rel: "alternate".to_string(),
                                    hreflang: alt_lang.to_string(),
                                    href,
                                });
                            }
                        }
                    }

                    // x-default -> point to english canonical
                    let default_href =
                        format!("https://{domain}/blog/article/{slug}", slug = blog.slug);
                    alternates.push(output::BlogAlternateLink {
                        rel: "alternate".to_string(),
                        hreflang: "x-default".to_string(),
                        href: default_href,
                    });

                    urlset.push(output::BlogSitemapUrl {
                        loc,
                        alternates,
                        ..Default::default()
                    });
                }
            }
        }

        let preamble = r#"<?xml version="1.0" encoding="UTF-8"?>"#;

        let sitemap_entity = output::BlogSitemapEntity {
            xmlns_xhtml: Some("http://www.w3.org/1999/xhtml".to_string()),
            urls: urlset,
            ..Default::default()
        };

        let sitemap = quick_xml::se::to_string(&sitemap_entity).inspect_err(|e| {
            tracing::error!("{e}");
        })?;

        Ok(format!("{preamble}{sitemap}"))
    }

    #[tracing::instrument(skip(self), err)]
    pub async fn generate_rss(
        &self,
        language: input::BlogLanguageEntity,
    ) -> Result<String, BlogUseCaseError> {
        let blogs = self.list_blogs(language.clone()).await?;

        let domain = crate::domain_name()?;

        let items: Vec<rss::Item> = blogs
            .into_iter()
            .map(|blog| {
                let link = format!(
                    "https://{domain}{language_prefix}/blog/article/{slug}",
                    language_prefix = match language {
                        input::BlogLanguageEntity::En => "".to_string(),
                        _ => format!("/{}", language.to_string()),
                    },
                    slug = blog.slug
                );

                rss::ItemBuilder::default()
                    .title(blog.title)
                    .description(blog.description)
                    .pub_date(
                        blog.created_at
                            .format(&time::format_description::well_known::Rfc3339)
                            .unwrap(),
                    )
                    .link(link)
                    .build()
            })
            .collect();

        let channel = rss::ChannelBuilder::default()
            .title("Ikuma's Blog")
            .link(format!(
                "https://{domain}{language_prefix}/blog",
                language_prefix = match language {
                    input::BlogLanguageEntity::En => "".to_string(),
                    _ => format!("/{}", language.to_string()),
                }
            ))
            .description("Ikuma's personal blog about software development and technology.")
            .items(items)
            .build();

        let rss_feed = channel.to_string();

        Ok(rss_feed)
    }

    #[tracing::instrument(skip(self), err)]
    pub async fn generate_atom(
        &self,
        language: input::BlogLanguageEntity,
    ) -> Result<String, BlogUseCaseError> {
        let domain = crate::domain_name()?;

        let blogs = self.list_blogs(language.clone()).await?;

        let entries = blogs
            .into_iter()
            .map(|blog| {
                let url = format!(
                    "https://{domain}{language_prefix}/blog/article/{}",
                    blog.slug,
                    language_prefix = match language {
                        input::BlogLanguageEntity::En => "".to_string(),
                        _ => format!("/{}", language.to_string()),
                    }
                );

                let timestamp = blog.created_at.unix_timestamp();
                let nanos = blog.created_at.nanosecond();
                let chrono_utc_dt =
                    chrono::DateTime::<chrono::Utc>::from_timestamp(timestamp, nanos)
                        .expect("Invalid timestamp");
                let chrono_datetime = chrono_utc_dt.fixed_offset();

                atom_syndication::EntryBuilder::default()
                    .title(blog.title)
                    .summary(
                        atom_syndication::TextBuilder::default()
                            .value(blog.description)
                            .build(),
                    )
                    .id(url.clone())
                    .link(atom_syndication::LinkBuilder::default().href(url).build())
                    .published(Some(chrono_datetime))
                    .build()
            })
            .collect::<Vec<atom_syndication::Entry>>();

        let feed = atom_syndication::FeedBuilder::default()
            .entries(entries)
            .title("Ikuma's Blog")
            .author(atom_syndication::Person {
                name: "Ikuma Yamashita".to_owned(),
                email: None,
                uri: None,
            })
            .build();

        Ok(feed.to_string())
    }

    #[tracing::instrument(skip(self), err)]
    pub async fn generate_jsonfeed(
        &self,
        language: input::BlogLanguageEntity,
    ) -> Result<String, BlogUseCaseError> {
        let blogs = self.list_blogs(language.clone()).await?;

        let domain = crate::domain_name()?;

        let items: Vec<jsonfeed::Item> = blogs
            .into_iter()
            .map(|blog| {
                let url = format!(
                    "https://{domain}{language_prefix}/blog/article/{slug}",
                    language_prefix = match language {
                        input::BlogLanguageEntity::En => "".to_string(),
                        _ => format!("/{}", language.to_string()),
                    },
                    slug = blog.slug
                );

                jsonfeed::Item {
                    id: url.clone(),
                    url: Some(url),
                    title: Some(blog.title),
                    content: jsonfeed::Content::Text(blog.description),
                    ..Default::default()
                }
            })
            .collect();

        let feed = jsonfeed::Feed {
            version: "https://jsonfeed.org/version/1".to_string(),
            title: "Ikuma's Blog".to_string(),
            home_page_url: Some(format!(
                "https://{domain}{language_prefix}/blog",
                language_prefix = match language {
                    input::BlogLanguageEntity::En => "".to_string(),
                    _ => format!("/{}", language.to_string()),
                }
            )),
            description: Some(
                "Ikuma's personal blog about software development and technology.".to_string(),
            ),
            items,
            ..Default::default()
        };

        let json_feed = serde_json::to_string_pretty(&feed).inspect_err(|e| {
            tracing::error!("{e}");
        })?;

        Ok(json_feed)
    }
}
