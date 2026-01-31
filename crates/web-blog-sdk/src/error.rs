#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("reqwest HTTP error: {0}")]
    Reqwest(#[from] reqwest::Error),

    #[error("Notion API request failed: {0}")]
    NotionApi(#[from] notionrs::Error),

    #[error("notion-to-jarkup error: {0}")]
    NotionToJarkup(#[from] notion_to_jarkup::error::Error),

    #[error("property '{0}' not found in Notion page")]
    NotionPagePropertyNotFound(String),

    #[error("property '{0}' has unexpected schema type")]
    NotionInvalidSchema(String),

    #[error("{0}")]
    NotionRecord(String),

    #[error("time parse error: {0}")]
    TimeParse(#[from] time::error::Parse),
}
