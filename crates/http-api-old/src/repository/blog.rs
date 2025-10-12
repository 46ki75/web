//! BlogRepository module
#![deny(missing_docs)]

use notionrs_types::prelude::*;

#[allow(missing_docs)]
#[derive(Debug)]
pub enum BlogLanguageRepositoryInput {
    En,
    Ja,
}

/// Repository that fetches data from the Notion API endpoints.
#[async_trait::async_trait]
pub trait BlogRepository {
    /// Retrieves a blog by its page ID.
    async fn get_blog_by_id(
        &self,
        page_id: &str,
    ) -> Result<crate::record::blog::BlogRecord, crate::error::Error>;

    /// Retrieves all blogs.
    async fn list_blogs(
        &self,
        language: BlogLanguageRepositoryInput,
    ) -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error>;

    /// Retrieves the children of the page by its page ID.
    async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error>;

    /// Fetches an image binary by its URL.
    async fn fetch_image_by_url(&self, url: &str) -> Result<bytes::Bytes, crate::error::Error>;

    /// Fetches an image binary of the block by its block ID.
    async fn fetch_image_by_block_id(
        &self,
        block_id: &str,
    ) -> Result<bytes::Bytes, crate::error::Error>;
}

/// Implementation of `BlogRepository` trait.
///
/// This struct provides a concrete implementation of the `BlogRepository` trait,
/// using external dependencies such as the Notion API client to interact with the blog database.
#[derive(Debug, Clone)]
pub struct BlogRepositoryImpl {}

#[async_trait::async_trait]
impl BlogRepository for BlogRepositoryImpl {
    async fn get_blog_by_id(
        &self,
        page_id: &str,
    ) -> Result<crate::record::blog::BlogRecord, crate::error::Error> {
        let notionrs_client = crate::cache::get_or_init_notionrs_client().await?;

        let request = notionrs_client.get_page().page_id(page_id);

        let blog = request.send().await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        crate::record::blog::BlogRecord::try_from(blog)
    }

    async fn list_blogs(
        &self,
        language: BlogLanguageRepositoryInput,
    ) -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error> {
        let notionrs_client = crate::cache::get_or_init_notionrs_client().await?;

        let notion_blog_database_id = crate::cache::get_or_init_notion_blog_database_id().await?;

        let status_filter =
            notionrs_types::object::request::filter::Filter::status_equals("Status", "Published");

        let language_filter = Filter::select_equals(
            "Language",
            match language {
                BlogLanguageRepositoryInput::En => "en",
                BlogLanguageRepositoryInput::Ja => "ja",
            }
            .to_owned(),
        );

        let filters = Filter::and(vec![status_filter, language_filter]);

        let request = notionrs_client
            .query_database()
            .filter(filters)
            .database_id(notion_blog_database_id);

        let response = notionrs::Client::paginate(request).await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        let blogs = response
            .into_iter()
            .map(crate::record::blog::BlogRecord::try_from)
            .collect::<Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error>>()?;

        Ok(blogs)
    }

    async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error> {
        let client = crate::cache::get_or_init_notion_to_jarkup_client().await?;

        let response = client.convert_block(page_id).await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        Ok(serde_json::to_string(&response).map_err(|e| {
            tracing::error!("An error occurred while serialize response: {}", e);
            crate::error::Error::Serialization(e.to_string())
        })?)
    }

    async fn fetch_image_by_url(&self, url: &str) -> Result<bytes::Bytes, crate::error::Error> {
        let response = reqwest::get(url).await.map_err(|e| {
            tracing::error!("An error occurred while fetch image: {}", e);
            crate::error::Error::FetchImage(e.to_string())
        })?;

        let bytes = response.bytes().await.map_err(|e| {
            tracing::error!("An error occurred while fetch image: {}", e);
            crate::error::Error::FetchImage(e.to_string())
        })?;

        Ok(bytes)
    }

    async fn fetch_image_by_block_id(
        &self,
        block_id: &str,
    ) -> Result<bytes::Bytes, crate::error::Error> {
        let notionrs_client = crate::cache::get_or_init_notionrs_client().await?;

        let request = notionrs_client.get_block().block_id(block_id);

        let response = request.send().await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        let url = match response.block {
            notionrs_types::object::block::Block::Image { image } => image.get_url(),
            _ => {
                return Err(crate::error::Error::NotionDatabaseInvalidSchema(
                    "The requested block is not an Image block.".to_string(),
                ));
            }
        };

        let response = reqwest::get(url).await.map_err(|e| {
            tracing::error!("An error occurred while fetch image: {}", e);
            crate::error::Error::FetchImage(e.to_string())
        })?;

        let bytes = response.bytes().await.map_err(|e| {
            tracing::error!("An error occurred while fetch image: {}", e);
            crate::error::Error::FetchImage(e.to_string())
        })?;

        Ok(bytes)
    }
}

/// Stub implementation of `BlogRepository` for testing and development.
/// Each method returns sample data.
#[derive(Debug, Clone)]
pub struct BlogRepositoryStab {}

#[async_trait::async_trait]
impl BlogRepository for BlogRepositoryStab {
    /// Returns a sample blog record for the given page ID.
    async fn get_blog_by_id(
        &self,
        page_id: &str,
    ) -> Result<crate::record::blog::BlogRecord, crate::error::Error> {
        Ok(crate::record::blog::BlogRecord {
            id: page_id.to_string(),
            slug: "sample-slug".to_string(),
            title: "サンプルブログタイトル".to_string(),
            description: "これはサンプルのブログ記事です。".to_string(),
            ogp_image_s3_url: Some("https://example.com/sample-ogp.png".to_string()),
            tags: vec![crate::record::blog::BlogTagRecord {
                id: "tag1".to_string(),
                name: "サンプルタグ".to_string(),
                color: crate::record::blog::BlogTagColorRecord::Blue,
            }],
            status: crate::record::blog::BlogStatusRecord::Published,
            keywords: "サンプル,ブログ".to_string(),
            created_at: "2025-08-29T00:00:00Z".to_string(),
            updated_at: "2025-08-29T00:00:00Z".to_string(),
            url: format!("https://example.com/blog/{}", page_id),
            featured: true,
        })
    }

    /// Returns a sample list of blog records.
    async fn list_blogs(
        &self,
        _language: BlogLanguageRepositoryInput,
    ) -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error> {
        Ok(vec![crate::record::blog::BlogRecord {
            id: "sample-id".to_string(),
            slug: "sample-slug".to_string(),
            title: "サンプルブログタイトル".to_string(),
            description: "これはサンプルのブログ記事です。".to_string(),
            ogp_image_s3_url: Some("https://example.com/sample-ogp.png".to_string()),
            tags: vec![crate::record::blog::BlogTagRecord {
                id: "tag1".to_string(),
                name: "サンプルタグ".to_string(),
                color: crate::record::blog::BlogTagColorRecord::Blue,
            }],
            status: crate::record::blog::BlogStatusRecord::Published,
            keywords: "サンプル,ブログ".to_string(),
            created_at: "2025-08-29T00:00:00Z".to_string(),
            updated_at: "2025-08-29T00:00:00Z".to_string(),
            url: "https://example.com/blog/sample-id".to_string(),
            featured: true,
        }])
    }

    /// Returns sample block data as a JSON string.
    async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error> {
        Ok(format!(
            "{{'block_id':'{}','content':'サンプルブロック'}}",
            page_id
        ))
    }

    /// Returns sample image bytes.
    async fn fetch_image_by_url(&self, _url: &str) -> Result<bytes::Bytes, crate::error::Error> {
        Ok(bytes::Bytes::from_static(b"sample image data"))
    }

    /// Returns sample image bytes.
    async fn fetch_image_by_block_id(
        &self,
        _block_id: &str,
    ) -> Result<bytes::Bytes, crate::error::Error> {
        Ok(bytes::Bytes::from_static(b"sample image data"))
    }
}
// ...existing code...
