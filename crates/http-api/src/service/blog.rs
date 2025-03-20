pub struct BlogService {
    pub blog_repository: std::sync::Arc<dyn crate::repository::blog::BlogRepository + Send + Sync>,
}

impl BlogService {
    pub async fn get_blog_by_id(
        &self,
        id: &str,
    ) -> Result<crate::entity::blog::BlogEntity, crate::error::Error> {
        let blog_record = self.blog_repository.get_blog_by_id(id).await?;

        let blog_entity = crate::entity::blog::BlogEntity::from(blog_record);

        Ok(blog_entity)
    }

    pub async fn list_blogs(
        &self,
    ) -> Result<Vec<crate::entity::blog::BlogEntity>, crate::error::Error> {
        let blog_records = self.blog_repository.list_blogs().await?;

        let blog_entities = blog_records
            .into_iter()
            .map(crate::entity::blog::BlogEntity::from)
            .collect::<Vec<crate::entity::blog::BlogEntity>>();

        Ok(blog_entities)
    }

    pub async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error> {
        let block_children = self.blog_repository.get_block_children(page_id).await?;

        Ok(block_children)
    }

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
}
