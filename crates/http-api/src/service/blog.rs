//! Service that invokes repository methods and executes business logic

/// Service that invokes repository methods and executes business logic
pub struct BlogService {
    /// Instance of BlogRepository. Injected at the entry point.
    pub blog_repository: std::sync::Arc<dyn crate::repository::blog::BlogRepository + Send + Sync>,
}

#[allow(missing_docs)]
#[derive(Debug)]
pub enum BlogLanguageServiceInput {
    En,
    Ja,
}

impl From<BlogLanguageServiceInput> for crate::repository::blog::BlogLanguageRepositoryInput {
    fn from(value: BlogLanguageServiceInput) -> Self {
        match value {
            BlogLanguageServiceInput::En => Self::En,
            BlogLanguageServiceInput::Ja => Self::Ja,
        }
    }
}

impl BlogService {
    /// Fetches the blog by its page ID.
    pub async fn get_blog_by_id(
        &self,
        id: &str,
    ) -> Result<crate::entity::blog::BlogEntity, crate::error::Error> {
        let blog_record = self.blog_repository.get_blog_by_id(id).await?;

        let blog_entity = crate::entity::blog::BlogEntity::from(blog_record);

        Ok(blog_entity)
    }

    /// Fetches all blogs.
    pub async fn list_blogs(
        &self,
        language: BlogLanguageServiceInput,
    ) -> Result<Vec<crate::entity::blog::BlogEntity>, crate::error::Error> {
        let blog_records = self
            .blog_repository
            .list_blogs(crate::repository::blog::BlogLanguageRepositoryInput::from(
                language,
            ))
            .await?;

        let blog_entities = blog_records
            .into_iter()
            .map(crate::entity::blog::BlogEntity::from)
            .collect::<Vec<crate::entity::blog::BlogEntity>>();

        Ok(blog_entities)
    }

    /// Fetches block children of the blog by its page ID.
    pub async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error> {
        let block_children = self.blog_repository.get_block_children(page_id).await?;

        Ok(block_children)
    }

    /// Infers mime-type from bytes.
    pub fn infer_mime_type(&self, image_bytes: &bytes::Bytes) -> String {
        infer::get(&image_bytes)
            .map(|t| t.to_string())
            .unwrap_or(String::from("application/octet-stream"))
    }

    /// Fetches OGP image binary by its blog page ID.
    pub async fn fetch_ogp_image_by_id(
        &self,
        page_id: &str,
    ) -> Result<Option<bytes::Bytes>, crate::error::Error> {
        let blog = self.blog_repository.get_blog_by_id(page_id).await?;

        let ogp_image_s3_url = match blog.ogp_image_s3_url {
            Some(url) => url,
            None => return Ok(None),
        };

        let image_bytes = self
            .blog_repository
            .fetch_image_by_url(&ogp_image_s3_url)
            .await?;

        Ok(Some(image_bytes))
    }

    /// Fetches image bynary of the block by its block ID.
    pub async fn fetch_block_image_by_id(
        &self,
        block_id: &str,
    ) -> Result<Option<bytes::Bytes>, crate::error::Error> {
        let image_bytes = self
            .blog_repository
            .fetch_image_by_block_id(block_id)
            .await?;

        Ok(Some(image_bytes))
    }

    /// Fetches the tag by its tag ID.
    pub async fn get_tag_by_id(
        &self,
        tag_id: &str,
        language: BlogLanguageServiceInput,
    ) -> Result<Option<crate::entity::blog::BlogTagEntity>, crate::error::Error> {
        let tag_records = self
            .blog_repository
            .list_tags(crate::repository::blog::BlogLanguageRepositoryInput::from(
                language,
            ))
            .await?;

        for tag_record in tag_records {
            if tag_record.id == tag_id {
                return Ok(Some(crate::entity::blog::BlogTagEntity::from(tag_record)));
            }
        }

        Ok(None)
    }

    /// Fetches all tags.
    pub async fn list_tags(
        &self,
        language: BlogLanguageServiceInput,
    ) -> Result<Vec<crate::entity::blog::BlogTagEntity>, crate::error::Error> {
        let tag_records = self
            .blog_repository
            .list_tags(crate::repository::blog::BlogLanguageRepositoryInput::from(
                language,
            ))
            .await?;

        let tag_entities = tag_records
            .into_iter()
            .map(crate::entity::blog::BlogTagEntity::from)
            .collect::<Vec<crate::entity::blog::BlogTagEntity>>();

        Ok(tag_entities)
    }

    /// Fetches all blogs associated with the tags.
    pub async fn list_blogs_by_tags(
        &self,
        tags: Vec<String>,
    ) -> Result<Vec<crate::entity::blog::BlogEntity>, crate::error::Error> {
        let blog_records = self.blog_repository.list_blogs_by_tags(tags).await?;

        let blog_entities = blog_records
            .into_iter()
            .map(crate::entity::blog::BlogEntity::from)
            .collect::<Vec<crate::entity::blog::BlogEntity>>();

        Ok(blog_entities)
    }
}
