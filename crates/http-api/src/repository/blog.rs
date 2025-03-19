#[async_trait::async_trait]
pub trait BlogRepository {
    async fn get_blog_by_id(
        &self,
        page_id: &str,
    ) -> Result<crate::record::blog::BlogRecord, crate::error::Error>;

    async fn list_blogs(&self)
    -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error>;

    async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error>;
}

pub struct BlogRepositoryImpl {
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
}
