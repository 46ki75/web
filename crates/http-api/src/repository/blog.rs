//! BlogRepository module
#![deny(missing_docs)]

/// The repository trait for blog.
#[async_trait::async_trait]
pub trait BlogRepository {
    /// Retrieves a blog by its page ID.
    async fn get_blog_by_id(
        &self,
        page_id: &str,
    ) -> Result<crate::record::blog::BlogRecord, crate::error::Error>;

    /// Retrieves all blogs.
    async fn list_blogs(&self)
    -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error>;

    /// Retrieves the children of the page by its page ID.
    async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error>;

    /// Fetches an image binary by its URL.
    async fn fetch_image_by_url(&self, url: &str) -> Result<bytes::Bytes, crate::error::Error>;

    /// Fetches an image binary of the block by its block ID.
    async fn fetch_image_by_block_id(
        &self,
        block_id: &str,
    ) -> Result<bytes::Bytes, crate::error::Error>;

    /// Lists all tags.
    async fn list_tags(
        &self,
    ) -> Result<Vec<crate::record::blog::BlogTagRecord>, crate::error::Error>;

    /// Lists all blogs that contain the specified tags.
    async fn list_blogs_by_tags(
        &self,
        tags: Vec<String>,
    ) -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error>;
}

/// The implementation of `BlogRepository` trait.
///
/// This struct provides the concrete implementation of the `BlogRepository` trait,
/// using external dependencies such as the Notion API client to interact with the blog database.
#[derive(Debug, Clone)]
pub struct BlogRepositoryImpl {
    /// The application configuration.
    pub config: crate::config::Config,
}

#[async_trait::async_trait]
impl BlogRepository for BlogRepositoryImpl {
    async fn get_blog_by_id(
        &self,
        page_id: &str,
    ) -> Result<crate::record::blog::BlogRecord, crate::error::Error> {
        let request = self.config.notionrs_client.get_page().page_id(page_id);

        let blog = request.send().await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        crate::record::blog::BlogRecord::try_from(blog)
    }

    async fn list_blogs(
        &self,
    ) -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error> {
        let filter =
            notionrs::object::request::filter::Filter::status_equals("Status", "Published");

        let request = self
            .config
            .notionrs_client
            .query_database_all()
            .filter(filter)
            .database_id(&self.config.notion_blog_database_id);

        let response = request.send().await.map_err(|e| {
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
        let mut client = elmethis_notion::client::Client::new(&self.config.notion_api_key);

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
        let request = self.config.notionrs_client.get_block().block_id(block_id);

        let response = request.send().await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        let url = match response.block {
            notionrs::object::block::Block::Image { image } => image.get_url(),
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

    async fn list_tags(
        &self,
    ) -> Result<Vec<crate::record::blog::BlogTagRecord>, crate::error::Error> {
        let request = self
            .config
            .notionrs_client
            .retrieve_database()
            .database_id(&self.config.notion_blog_database_id);

        let response = request.send().await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        let properties = response.properties.get("Tags").ok_or_else(|| {
            tracing::error!("Notion database property not found: Tags");
            crate::error::Error::NotionDatabasePropertyNotFound("Tags".to_string())
        })?;

        let tags_property = match properties {
            notionrs::object::database::DatabaseProperty::MultiSelect(property) => {
                &property.multi_select.options
            }
            _ => {
                tracing::error!("Notion database invalid schema: Tags");
                return Err(crate::error::Error::NotionDatabaseInvalidSchema(
                    "Tags".to_string(),
                ));
            }
        }
        .clone();

        let tags = tags_property
            .into_iter()
            .map(crate::record::blog::BlogTagRecord::try_from)
            .collect::<Result<Vec<crate::record::blog::BlogTagRecord>, crate::error::Error>>()?;

        Ok(tags)
    }

    async fn list_blogs_by_tags(
        &self,
        tags: Vec<String>,
    ) -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error> {
        let mut filters: Vec<notionrs::object::request::filter::Filter> =
            vec![notionrs::object::request::filter::Filter::status_equals(
                "Status",
                "Published",
            )];

        for tag in tags {
            filters.push(
                notionrs::object::request::filter::Filter::multi_select_contains("Tags", tag),
            );
        }

        let request = self
            .config
            .notionrs_client
            .query_database()
            .filter(notionrs::object::request::filter::Filter::and(filters))
            .database_id(&self.config.notion_blog_database_id);

        let response = request.send().await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        let blogs = response
            .results
            .into_iter()
            .map(crate::record::blog::BlogRecord::try_from)
            .collect::<Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error>>()?;

        Ok(blogs)
    }
}
