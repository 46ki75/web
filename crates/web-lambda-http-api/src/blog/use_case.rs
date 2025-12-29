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

        Ok(super::entity::BlogContentsEntity { components })
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
}
