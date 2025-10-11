#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Notion API request failed: {0}")]
    NotionApi(#[from] notionrs::Error),

    #[error("notion-to-jarkup error: {0}")]
    NotionToJarkup(#[from] notion_to_jarkup::error::Error),

    #[error("property '{0}' not found in Notion page")]
    NotionPagePropertyNotFound(String),

    #[error("property '{0}' has unexpected schema type")]
    NotionPagePropertySchema(String),

    #[error("{0}")]
    NotionRecord(String),
}
