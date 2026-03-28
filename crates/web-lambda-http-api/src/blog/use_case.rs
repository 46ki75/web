use image::GenericImageView;

#[derive(Clone)]
pub struct BlogUseCase {
    pub blog_repository: std::sync::Arc<dyn super::repository::BlogRepository + Send + Sync>,
}

impl BlogUseCase {
    pub async fn list_blogs(
        &self,
        language: super::entity::BlogLanguageEntity,
    ) -> Result<Vec<super::entity::BlogEntity>, crate::error::Error> {
        let language = match language {
            crate::blog::entity::BlogLanguageEntity::En => super::dto::BlogLanguageDto::En,
            crate::blog::entity::BlogLanguageEntity::Ja => super::dto::BlogLanguageDto::Ja,
        };

        let blog_dtoes = self.blog_repository.list_blogs(language).await?;

        let blog_entities = blog_dtoes
            .into_iter()
            .map(|dto| super::entity::BlogEntity::from(dto))
            .collect::<Vec<super::entity::BlogEntity>>();

        Ok(blog_entities)
    }

    pub async fn get_blog_by_slug(
        &self,
        slug: &str,
        language: super::entity::BlogLanguageEntity,
    ) -> Result<super::entity::BlogEntity, crate::error::Error> {
        let language = match language {
            crate::blog::entity::BlogLanguageEntity::En => super::dto::BlogLanguageDto::En,
            crate::blog::entity::BlogLanguageEntity::Ja => super::dto::BlogLanguageDto::Ja,
        };

        let blog_dtoes = self.blog_repository.list_blogs(language).await?;

        let blog_dto = blog_dtoes
            .into_iter()
            .find(|blog| blog.slug == slug)
            .ok_or(crate::error::Error::NotionBlogNotFound(slug.to_owned()))?;

        Ok(blog_dto.into())
    }

    pub async fn get_blog_contents(
        &self,
        slug: &str,
        language: super::entity::BlogLanguageEntity,
    ) -> Result<super::entity::BlogContentsEntity, crate::error::Error> {
        let blog = self.get_blog_by_slug(slug, language.clone()).await?;

        let language = match language {
            crate::blog::entity::BlogLanguageEntity::En => super::dto::BlogLanguageDto::En,
            crate::blog::entity::BlogLanguageEntity::Ja => super::dto::BlogLanguageDto::Ja,
        };

        let mut components = self
            .blog_repository
            .get_blog_contents(slug, language)
            .await?;

        Self::rewrite_components(&mut components);

        Ok(super::entity::BlogContentsEntity {
            meta: blog,
            components,
        })
    }

    pub async fn list_tags(
        &self,
    ) -> Result<Vec<super::entity::BlogTagEntity>, crate::error::Error> {
        let tag_dtos = self.blog_repository.list_tags().await?;
        let tags = tag_dtos
            .into_iter()
            .map(|tag| super::entity::BlogTagEntity::from(tag))
            .collect::<Vec<super::entity::BlogTagEntity>>();

        Ok(tags)
    }

    fn rewrite_inline_component(_inline_component: &mut jarkup_rs::InlineComponent) {}

    fn rewrite_inline_components(inline_components: &mut Vec<jarkup_rs::InlineComponent>) {
        for inline_component in inline_components {
            Self::rewrite_inline_component(inline_component);
        }
    }

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
    pub async fn fetch_ogp_image_by_slug(
        &self,
        slug: &str,
        language: super::entity::BlogLanguageEntity,
    ) -> Result<bytes::Bytes, crate::error::Error> {
        let blog = self.get_blog_by_slug(slug, language).await?;

        let ogp_image_s3_signed_url =
            blog.ogp_image_s3_signed_url
                .ok_or(crate::error::Error::NotionPagePropertyNotSet {
                    page_id: blog.page_id,
                    property: "cover".to_owned(),
                })?;

        let image_bytes = self
            .blog_repository
            .fetch_image_by_url(&ogp_image_s3_signed_url)
            .await?;

        Ok(image_bytes)
    }

    /// Fetches image bynary of the block by its block ID.
    pub async fn fetch_block_image_by_id(
        &self,
        block_id: &str,
    ) -> Result<bytes::Bytes, crate::error::Error> {
        let image_bytes = self
            .blog_repository
            .fetch_image_by_block_id(block_id)
            .await?;

        Ok(image_bytes)
    }

    pub fn convert_image(
        &self,
        image_bytes: &[u8],
        new_width: Option<u32>,
    ) -> Result<bytes::Bytes, crate::error::Error> {
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

    pub async fn generate_sitemap(&self) -> Result<String, crate::error::Error> {
        use strum::IntoEnumIterator;

        let languages: Vec<crate::blog::entity::BlogLanguageEntity> =
            crate::blog::entity::BlogLanguageEntity::iter().collect();

        // collect blogs per language
        let mut blogs_by_lang: std::collections::HashMap<String, Vec<super::entity::BlogEntity>> =
            std::collections::HashMap::new();
        for lang in &languages {
            let list = self.list_blogs(lang.clone()).await?;
            blogs_by_lang.insert(lang.to_string(), list);
        }

        let domain = crate::domain_name()?;

        let mut urlset: Vec<super::entity::BlogSitemapUrl> = Vec::new();

        for lang in &languages {
            let lang_key = lang.to_string();
            if let Some(blogs) = blogs_by_lang.get(&lang_key) {
                for blog in blogs {
                    let base_url = match lang {
                        crate::blog::entity::BlogLanguageEntity::En => format!("https://{domain}"),
                        _ => format!("https://{domain}/{}", lang.to_string()),
                    };

                    let loc = format!("{base_url}/blog/article/{slug}", slug = blog.slug);

                    // build alternates only when corresponding slug exists in that language
                    let mut alternates: Vec<super::entity::BlogAlternateLink> = Vec::new();
                    for alt_lang in &languages {
                        let alt_key = alt_lang.to_string();
                        if let Some(alt_blogs) = blogs_by_lang.get(&alt_key) {
                            if alt_blogs.iter().any(|b| b.slug == blog.slug) {
                                let alt_base = match alt_lang {
                                    crate::blog::entity::BlogLanguageEntity::En => {
                                        format!("https://{domain}")
                                    }
                                    _ => format!("https://{domain}/{}", alt_lang.to_string()),
                                };
                                let href =
                                    format!("{alt_base}/blog/article/{slug}", slug = blog.slug);
                                alternates.push(super::entity::BlogAlternateLink {
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
                    alternates.push(super::entity::BlogAlternateLink {
                        rel: "alternate".to_string(),
                        hreflang: "x-default".to_string(),
                        href: default_href,
                    });

                    urlset.push(super::entity::BlogSitemapUrl {
                        loc,
                        alternates,
                        ..Default::default()
                    });
                }
            }
        }

        let preamble = r#"<?xml version="1.0" encoding="UTF-8"?>"#;

        let sitemap_entity = super::entity::BlogSitemapEntity {
            xmlns_xhtml: Some("http://www.w3.org/1999/xhtml".to_string()),
            urls: urlset,
            ..Default::default()
        };

        let sitemap = quick_xml::se::to_string(&sitemap_entity).inspect_err(|e| {
            tracing::error!("{e}");
        })?;

        Ok(format!("{preamble}{sitemap}"))
    }

    pub async fn generate_rss(
        &self,
        language: super::entity::BlogLanguageEntity,
    ) -> Result<String, crate::error::Error> {
        let blogs = self.list_blogs(language.clone()).await?;

        let domain = crate::domain_name()?;

        let items: Vec<rss::Item> = blogs
            .into_iter()
            .map(|blog| {
                let link = format!(
                    "https://{domain}{language_prefix}/blog/article/{slug}",
                    language_prefix = match language {
                        crate::blog::entity::BlogLanguageEntity::En => "".to_string(),
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
                    crate::blog::entity::BlogLanguageEntity::En => "".to_string(),
                    _ => format!("/{}", language.to_string()),
                }
            ))
            .description("Ikuma's personal blog about software development and technology.")
            .items(items)
            .build();

        let rss_feed = channel.to_string();

        Ok(rss_feed)
    }

    pub async fn generate_atom(
        &self,
        language: super::entity::BlogLanguageEntity,
    ) -> Result<String, crate::error::Error> {
        let domain = crate::domain_name()?;

        let blogs = self.list_blogs(language.clone()).await?;

        let entries = blogs
            .into_iter()
            .map(|blog| {
                let url = format!(
                    "https://{domain}{language_prefix}/blog/article/{}",
                    blog.slug,
                    language_prefix = match language {
                        crate::blog::entity::BlogLanguageEntity::En => "".to_string(),
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

    pub async fn generate_jsonfeed(
        &self,
        language: super::entity::BlogLanguageEntity,
    ) -> Result<String, crate::error::Error> {
        let blogs = self.list_blogs(language.clone()).await?;

        let domain = crate::domain_name()?;

        let items: Vec<jsonfeed::Item> = blogs
            .into_iter()
            .map(|blog| {
                let url = format!(
                    "https://{domain}{language_prefix}/blog/article/{slug}",
                    language_prefix = match language {
                        crate::blog::entity::BlogLanguageEntity::En => "".to_string(),
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
                    crate::blog::entity::BlogLanguageEntity::En => "".to_string(),
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
