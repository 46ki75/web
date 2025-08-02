#![deny(missing_docs)]
//! Defines crate-wide error types for use throughout the application.

/// Error type for this crate.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    /// Occurs when environment variable is undefined.
    #[error("Environment variable not found: {0}")]
    EnvironmentVariableNotFound(String),

    /// Occurs when building response.
    #[error("Failed to build response: {0}")]
    BuildResponse(String),

    /// Occurs when fetching an SSM Parameter fails.
    #[error("Failed to fetch SSM Parameter: {0}")]
    SsmParameter(String),

    /// Occurs when invoking the Notion API fails.
    #[error("An error occurred while invoking Notion API: {0}")]
    NotionAPI(String),

    /// Occurs when a required Notion database property is missing in response.
    #[error("Notion database property not found: {0}")]
    NotionDatabasePropertyNotFound(String),

    /// Occurs when the schema of a Notion database is invalid.
    #[error("Notion database invalid schema: {0}")]
    NotionDatabaseInvalidSchema(String),

    /// Occurs when serializing JSON fails.
    #[error("Failed to serialize response: {0}")]
    Serialization(String),

    /// Occurs when deserializing JSON fails.
    #[error("Failed to deserialize response: {0}")]
    Deserialization(String),

    /// Occurs when fetching an image from an HTTP endpoint fails.
    #[error("Failed to fetch image: {0}")]
    FetchImage(String),

    /// Occurs when the image format is invalid.
    #[error("Failed to fetch image: {0}")]
    ImageFormat(String),

    /// Occurs when decoding an image fails.
    #[error("Failed to decode image: {0}")]
    ImageDecode(String),

    /// Occurs when encoding an image fails.
    #[error("Failed to encode image: {0}")]
    ImageEncode(String),

    /// Occurs when sending an HTTP request.
    #[error("Failed to send HTTP request: {0}")]
    ReqwestHttp(String),

    /// Occurs when reading the HTTP response body stream.
    #[error("Failed to read HTTP response body: {0}")]
    ReqwestHttpResponseBodyStream(String),
}
