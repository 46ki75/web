#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Environmental variable not found: {0}")]
    EnvironmentalVariableNotFound(String),

    #[error("Failed to build response: {0}")]
    BuildResponse(String),

    #[error("Failed to fetch SSM Parameter: {0}")]
    SsmParameter(String),

    #[error("An error occurred while invoke Notion API: {0}")]
    NotionAPI(String),

    #[error("Notion database property not found: {0}")]
    NotionDatabasePropertyNotFound(String),

    #[error("Notion database invalid schema: {0}")]
    NotionDatabaseInvalidSchema(String),
}
