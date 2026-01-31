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

        let components = self
            .blog_repository
            .get_blog_contents(slug, language)
            .await?;

        let mut icons: Vec<String> = vec![];
        let mut images: Vec<(String, String)> = vec![];
        let mut files: Vec<String> = vec![];

        Self::extract_files(&components, &mut icons, &mut images, &mut files)?;

        let mut components_string = serde_json::to_string(&components).inspect_err(|_| {
            tracing::error!("Failed to serialize blog components to JSON string");
        })?;

        for image in images.iter() {
            components_string = components_string.replace(
                &image.0,
                &format!("/api/v2/blog/{}/block-image/{}", slug, image.1),
            );
        }

        let components: Vec<jarkup_rs::Component> = serde_json::from_str(&components_string)
            .inspect_err(|_| {
                tracing::error!("Failed to deserialize blog components from JSON string");
            })?;

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

    fn extract_files(
        components: &Vec<jarkup_rs::Component>,
        icons: &mut Vec<String>,
        images: &mut Vec<(String, String)>,
        files: &mut Vec<String>,
    ) -> Result<(), crate::error::Error> {
        for component in components {
            match component {
                jarkup_rs::Component::InlineComponent(inline_component) => {
                    if let jarkup_rs::InlineComponent::Icon(icon) = inline_component {
                        icons.push(icon.props.src.clone());
                    }
                }
                jarkup_rs::Component::BlockComponent(block_component) => match block_component {
                    jarkup_rs::BlockComponent::File(file) => {
                        files.push(file.props.src.clone());
                    }
                    jarkup_rs::BlockComponent::Image(image) => {
                        images.push((image.props.src.clone(), image.id.clone().unwrap()));
                    }
                    jarkup_rs::BlockComponent::Heading(heading) => {
                        Self::extract_from_inline_components(
                            &heading.slots.default,
                            icons,
                            images,
                            files,
                        )?;
                    }
                    jarkup_rs::BlockComponent::Paragraph(paragraph) => {
                        Self::extract_from_inline_components(
                            &paragraph.slots.default,
                            icons,
                            images,
                            files,
                        )?;
                    }
                    jarkup_rs::BlockComponent::ListItem(list_item) => {
                        Self::extract_from_inline_components(
                            &list_item.slots.default,
                            icons,
                            images,
                            files,
                        )?;
                    }
                    jarkup_rs::BlockComponent::List(list) => {
                        Self::extract_files(&list.slots.default, icons, images, files)?;
                    }
                    jarkup_rs::BlockComponent::BlockQuote(block_quote) => {
                        Self::extract_files(&block_quote.slots.default, icons, images, files)?;
                    }
                    jarkup_rs::BlockComponent::Callout(callout) => {
                        Self::extract_files(&callout.slots.default, icons, images, files)?;
                    }
                    jarkup_rs::BlockComponent::Divider(_divider) => {}
                    jarkup_rs::BlockComponent::Toggle(toggle) => {
                        Self::extract_files(&toggle.slots.default, icons, images, files)?;
                        Self::extract_from_inline_components(
                            &toggle.slots.summary,
                            icons,
                            images,
                            files,
                        )?;
                    }
                    jarkup_rs::BlockComponent::Bookmark(_bookmark) => {}
                    jarkup_rs::BlockComponent::CodeBlock(code_block) => {
                        if let Some(slots) = &code_block.slots {
                            Self::extract_from_inline_components(
                                &slots.default,
                                icons,
                                images,
                                files,
                            )?;
                        }
                    }
                    jarkup_rs::BlockComponent::Katex(_katex) => {}
                    jarkup_rs::BlockComponent::Mermaid(_mermaid) => {}
                    jarkup_rs::BlockComponent::Table(table) => {
                        if let Some(header) = &table.slots.header {
                            Self::extract_files(header, icons, images, files)?;
                        }
                        Self::extract_files(&table.slots.body, icons, images, files)?;
                    }
                    jarkup_rs::BlockComponent::TableRow(table_row) => {
                        Self::extract_files(&table_row.slots.default, icons, images, files)?;
                    }
                    jarkup_rs::BlockComponent::TableCell(table_cell) => {
                        Self::extract_from_inline_components(
                            &table_cell.slots.default,
                            icons,
                            images,
                            files,
                        )?;
                    }
                    jarkup_rs::BlockComponent::ColumnList(column_list) => {
                        Self::extract_files(&column_list.slots.default, icons, images, files)?;
                    }
                    jarkup_rs::BlockComponent::Column(column) => {
                        Self::extract_files(&column.slots.default, icons, images, files)?;
                    }
                    jarkup_rs::BlockComponent::Unsupported(_unsupported) => {}
                },
            };
        }

        Ok(())
    }

    fn extract_from_inline_components(
        inline_components: &[jarkup_rs::InlineComponent],
        icons: &mut Vec<String>,
        _images: &mut Vec<(String, String)>,
        _files: &mut Vec<String>,
    ) -> Result<(), crate::error::Error> {
        for inline in inline_components {
            if let jarkup_rs::InlineComponent::Icon(icon) = inline {
                icons.push(icon.props.src.clone());
            }
        }
        Ok(())
    }

    /// Infers mime-type from bytes.
    pub fn infer_mime_type(&self, image_bytes: &bytes::Bytes) -> String {
        infer::get(&image_bytes)
            .map(|t| t.to_string())
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

        let webp_bytes = self.convert(&image_bytes)?;

        Ok(webp_bytes)
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

        let webp_bytes = self.convert(&image_bytes)?;

        Ok(webp_bytes)
    }

    pub fn convert(&self, image_bytes: &[u8]) -> Result<bytes::Bytes, crate::error::Error> {
        let img = image::ImageReader::new(std::io::Cursor::new(image_bytes))
            .with_guessed_format()?
            .decode()?;

        let mut bytes = Vec::new();

        let encoder = image::codecs::webp::WebPEncoder::new_lossless(&mut bytes);

        img.write_with_encoder(encoder)?;

        Ok(bytes::Bytes::from(bytes))
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

        let stage_name = crate::stage_name()?;

        let domain = match stage_name.as_str() {
            "prod" => "www.ikuma.cloud",
            "staging" => "stg-www.ikuma.cloud",
            _ => "dev-www.ikuma.cloud",
        };

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

        let stage_name = crate::stage_name()?;

        let domain = match stage_name.as_str() {
            "prod" => "www.ikuma.cloud",
            "staging" => "stg-www.ikuma.cloud",
            _ => "dev-www.ikuma.cloud",
        };

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
                    .pub_date(blog.created_at)
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
}
