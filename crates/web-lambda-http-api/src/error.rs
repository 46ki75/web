/// Crate-root error used by shared infrastructure utilities and router initialisation.
///
/// This type is returned by helpers such as [`crate::stage_name`], the SSM parameter
/// cache, and the Notion client cache. Feature-specific layers wrap it (via `#[from]`)
/// into their own `*RepositoryError` or `*UseCaseError` as an opaque internal failure.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("environment variable not found: '{variable_name}'")]
    EnvironmentVariableNotFound { variable_name: String },

    #[error("SSM API failed for '{parameter_name}': {trace}")]
    SsmParameterApiFailed {
        parameter_name: String,
        trace: String,
    },

    #[error("SSM parameter not found: '{parameter_name}'")]
    SsmParameterNotFound { parameter_name: String },

    #[error("router init failed: {0}")]
    RouterInit(String),
}
