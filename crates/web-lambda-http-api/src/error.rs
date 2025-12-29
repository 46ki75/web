#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("EnvironmentVariableNotFound: environment variable not found: `{variable_name}`")]
    EnvironmentVariableNotFound { variable_name: String },

    #[error(
        "SsmParameterApiFailed: failed to fetch parameter: `{parameter_name}`, trace: {trace}"
    )]
    SsmParameterApiFailed {
        parameter_name: String,
        trace: String,
    },

    #[error("SsmParameterNotFound: parameter not found: `{parameter_name}`")]
    SsmParameterNotFound { parameter_name: String },

    #[error("reqwest HTTP error: {0}")]
    Reqwest(#[from] reqwest::Error),

    #[error("Notion API request failed: {0}")]
    NotionApi(#[from] notionrs::Error),

    #[error("notion-to-jarkup error: {0}")]
    NotionToJarkup(#[from] notion_to_jarkup::error::Error),

    #[error("slug '{0}' not found in blog")]
    NotionBlogNotFound(String),

    #[error("property '{0}' not found in Notion page")]
    NotionPagePropertyNotFound(String),

    #[error("property '{property}' is not set in page `{page_id}`")]
    NotionPagePropertyNotSet { page_id: String, property: String },

    #[error("property '{0}' has unexpected schema type")]
    NotionInvalidSchema(String),

    #[error("{0}")]
    NotionRecord(String),

    #[error("{0}")]
    FetchImage(String),

    #[error("{0}")]
    SerdeJson(#[from] serde_json::Error),

    #[error("image conversion error: {0}")]
    ImageConversion(#[from] image::ImageError),

    #[error("IO error: {0}")]
    ImegeIoError(#[from] std::io::Error),
}

impl Error {
    pub fn as_client_response(&self) -> (axum::http::StatusCode, String) {
        use axum::http::StatusCode;
        match self {
            Error::EnvironmentVariableNotFound { variable_name } => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Environment variable not found: `{}`", variable_name),
            ),
            Error::SsmParameterApiFailed {
                parameter_name,
                trace,
            } => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!(
                    "Failed to fetch SSM parameter: `{}`. Trace: {}",
                    parameter_name, trace
                ),
            ),
            Error::SsmParameterNotFound { parameter_name } => (
                StatusCode::NOT_FOUND,
                format!("SSM parameter not found: `{}`", parameter_name),
            ),
            Error::Reqwest(e) => (
                StatusCode::BAD_GATEWAY,
                format!("Upstream HTTP error: {}", e),
            ),
            Error::NotionApi(e) => (StatusCode::BAD_GATEWAY, format!("Notion API error: {}", e)),
            Error::NotionToJarkup(e) => (
                StatusCode::BAD_REQUEST,
                format!("Notion to Jarkup error: {}", e),
            ),
            Error::NotionBlogNotFound(prop) => (StatusCode::NOT_FOUND, prop.to_owned()),
            Error::NotionPagePropertyNotFound(prop) => (
                StatusCode::BAD_REQUEST,
                format!("Property '{}' not found in Notion page", prop),
            ),
            Error::NotionPagePropertyNotSet { page_id, property } => (
                StatusCode::BAD_REQUEST,
                format!("Property '{}' is not set in page '{}'", property, page_id),
            ),
            Error::NotionInvalidSchema(prop) => (
                StatusCode::BAD_REQUEST,
                format!("Property '{}' has unexpected schema type", prop),
            ),
            Error::NotionRecord(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            Error::FetchImage(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            Error::SerdeJson(e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("JSON serialization/deserialization error: {}", e),
            ),
            Error::ImageConversion(e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Image conversion error: {}", e),
            ),
            Error::ImegeIoError(e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Image IO error: {}", e),
            ),
        }
    }
}
