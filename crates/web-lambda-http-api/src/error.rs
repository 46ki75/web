#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("environment variable not found: `{variable_name}`")]
    EnvironmentVariableNotFound { variable_name: String },
}
