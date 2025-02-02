#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    EnvVar(#[from] std::env::VarError),

    #[error("{0}")]
    NotionApi(#[from] notionrs::error::Error),

    #[error("Attribute not found: {0}")]
    AttributeNotFound(String),
}
