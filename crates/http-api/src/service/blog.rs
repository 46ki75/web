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

        let img = image::ImageReader::new(std::io::Cursor::new(image_bytes))
            .with_guessed_format()
            .map_err(|e| {
                tracing::error!("Failed to guess image format: {}", e);
                crate::error::Error::ImageFormat(e.to_string())
            })?
            .decode()
            .map_err(|e| {
                tracing::error!("Failed to decode image: {}", e);
                crate::error::Error::ImageDecode(e.to_string())
            })?;

        let encoder = webp::Encoder::from_image(&img).map_err(|e| {
            tracing::error!("Failed to encode image: {}", e);
            crate::error::Error::ImageEncode(e.to_string())
        })?;

        let webp_bytes = bytes::Bytes::from(encoder.encode(80.0).to_vec());

        Ok(Some(webp_bytes))
    }

    pub async fn fetch_block_image_by_id(
        &self,
        block_id: &str,
    ) -> Result<Option<bytes::Bytes>, crate::error::Error> {
        let image_bytes = self
            .blog_repository
            .fetch_image_by_block_id(block_id)
            .await?;

        let img = image::ImageReader::new(std::io::Cursor::new(image_bytes))
            .with_guessed_format()
            .map_err(|e| {
                tracing::error!("Failed to guess image format: {}", e);
                crate::error::Error::ImageFormat(e.to_string())
            })?
            .decode()
            .map_err(|e| {
                tracing::error!("Failed to decode image: {}", e);
                crate::error::Error::ImageDecode(e.to_string())
            })?;

        let encoder = webp::Encoder::from_image(&img).map_err(|e| {
            tracing::error!("Failed to encode image: {}", e);
            crate::error::Error::ImageEncode(e.to_string())
        })?;

        let webp_bytes = bytes::Bytes::from(encoder.encode(80.0).to_vec());

        Ok(Some(webp_bytes))
    }

    pub async fn get_tag_by_id(
        &self,
        tag_id: &str,
    ) -> Result<Option<crate::entity::blog::BlogTagEntity>, crate::error::Error> {
        let tag_records = self.blog_repository.list_tags().await?;

        for tag_record in tag_records {
            if tag_record.id == tag_id {
                return Ok(Some(crate::entity::blog::BlogTagEntity::from(tag_record)));
            }
        }

        Ok(None)
    }

    pub async fn list_tags(
        &self,
    ) -> Result<Vec<crate::entity::blog::BlogTagEntity>, crate::error::Error> {
        let tag_records = self.blog_repository.list_tags().await?;

        let tag_entities = tag_records
            .into_iter()
            .map(crate::entity::blog::BlogTagEntity::from)
            .collect::<Vec<crate::entity::blog::BlogTagEntity>>();

        Ok(tag_entities)
    }

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
