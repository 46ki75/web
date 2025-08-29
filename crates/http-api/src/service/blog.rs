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

    /// Fetches all tags.
    pub async fn list_tags(
        &self,
        language: BlogLanguageServiceInput,
    ) -> Result<Vec<crate::entity::blog::BlogTagEntity>, crate::error::Error> {
        let blog_records = self
            .blog_repository
            .list_blogs(crate::repository::blog::BlogLanguageRepositoryInput::from(
                language,
            ))
            .await?;

        let mut tag_set = std::collections::HashSet::new();

        for blog in blog_records {
            for tag in blog.tags {
                tag_set.insert(tag);
            }
        }

        let tag_entities = tag_set
            .into_iter()
            .map(crate::entity::blog::BlogTagEntity::from)
            .collect();

        Ok(tag_entities)
    }

    /// Fetches the tag by its tag ID.
    pub async fn get_tag_by_id(
        &self,
        tag_id: &str,
        language: BlogLanguageServiceInput,
    ) -> Result<Option<crate::entity::blog::BlogTagEntity>, crate::error::Error> {
        let tag_records = self.list_tags(language).await?;

        for tag_record in tag_records {
            if tag_record.id == tag_id {
                return Ok(Some(crate::entity::blog::BlogTagEntity::from(tag_record)));
            }
        }

        Ok(None)
    }
}

#[cfg(test)]
mod test {

    #[tokio::test]
    async fn test_get_blog_by_id() -> Result<(), crate::error::Error> {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});

        let blog_service = crate::service::blog::BlogService { blog_repository };

        let _blog = blog_service
            .get_blog_by_id("25effec5-b9f2-4f3a-b8f4-5fae81f4dc49")
            .await?;

        Ok(())
    }

    #[tokio::test]
    async fn test_list_blogs_en() -> Result<(), crate::error::Error> {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        let blogs = blog_service
            .list_blogs(crate::service::blog::BlogLanguageServiceInput::En)
            .await?;

        assert_eq!(blogs.len(), 1);
        assert_eq!(blogs[0].id, "sample-id");
        assert_eq!(blogs[0].title, "サンプルブログタイトル");
        assert_eq!(blogs[0].keywords, vec!["サンプル", "ブログ"]);
        assert!(matches!(
            blogs[0].status,
            crate::entity::blog::BlogStatusEntity::Published
        ));

        Ok(())
    }

    #[tokio::test]
    async fn test_list_blogs_ja() -> Result<(), crate::error::Error> {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        let blogs = blog_service
            .list_blogs(crate::service::blog::BlogLanguageServiceInput::Ja)
            .await?;

        assert_eq!(blogs.len(), 1);
        assert_eq!(blogs[0].tags.len(), 1);
        assert_eq!(blogs[0].tags[0].id, "tag1");

        Ok(())
    }

    #[tokio::test]
    async fn test_get_block_children() -> Result<(), crate::error::Error> {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        let page_id = "abc123";
        let blocks = blog_service.get_block_children(page_id).await?;

        assert!(blocks.contains(page_id));
        assert!(blocks.contains("サンプルブロック"));

        Ok(())
    }

    #[test]
    fn test_infer_mime_type_unknown_defaults() {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        let bytes = bytes::Bytes::from_static(b"not an image");
        let mime = blog_service.infer_mime_type(&bytes);
        assert_eq!(mime, "application/octet-stream");
    }

    #[test]
    fn test_infer_mime_type_png() {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        // PNG magic number
        let png_header: [u8; 8] = [137, 80, 78, 71, 13, 10, 26, 10];
        let bytes = bytes::Bytes::copy_from_slice(&png_header);
        let mime = blog_service.infer_mime_type(&bytes);
        assert_eq!(mime, "image/png");
    }

    #[tokio::test]
    async fn test_fetch_ogp_image_by_id() -> Result<(), crate::error::Error> {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        let data = blog_service
            .fetch_ogp_image_by_id("any-id-with-ogp")
            .await?
            .expect("OGP image should exist in stub");

        assert_eq!(&data[..], b"sample image data");
        Ok(())
    }

    #[tokio::test]
    async fn test_fetch_block_image_by_id() -> Result<(), crate::error::Error> {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        let data = blog_service
            .fetch_block_image_by_id("block-123")
            .await?
            .expect("Image should exist in stub");

        assert_eq!(&data[..], b"sample image data");
        Ok(())
    }

    #[tokio::test]
    async fn test_list_tags() -> Result<(), crate::error::Error> {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        let tags = blog_service
            .list_tags(crate::service::blog::BlogLanguageServiceInput::Ja)
            .await?;

        assert_eq!(tags.len(), 1);
        assert_eq!(tags[0].id, "tag1");
        assert_eq!(tags[0].name, "サンプルタグ");

        Ok(())
    }

    #[tokio::test]
    async fn test_get_tag_by_id_found() -> Result<(), crate::error::Error> {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        let tag = blog_service
            .get_tag_by_id("tag1", crate::service::blog::BlogLanguageServiceInput::En)
            .await?;

        assert!(tag.is_some());
        let tag = tag.unwrap();
        assert_eq!(tag.id, "tag1");
        assert_eq!(tag.name, "サンプルタグ");
        Ok(())
    }

    #[tokio::test]
    async fn test_get_tag_by_id_not_found() -> Result<(), crate::error::Error> {
        let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryStab {});
        let blog_service = crate::service::blog::BlogService { blog_repository };

        let tag = blog_service
            .get_tag_by_id(
                "unknown",
                crate::service::blog::BlogLanguageServiceInput::Ja,
            )
            .await?;

        assert!(tag.is_none());
        Ok(())
    }
}
