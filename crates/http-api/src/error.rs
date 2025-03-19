#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Failed to build response: {0}")]
    BuildResponse(String),
}
