//! BlogRepository module
#![deny(missing_docs)]

/// Repository that fetches data regarding web frontend runtime config.
#[async_trait::async_trait]
pub trait WebConfigRepository {
    /// Fetches a string parameter from SSM Parameter Store.
    async fn fetch_parameter(&self, parameter_name: &str) -> Result<String, crate::error::Error>;
}

/// Implementation of `WebConfigRepository` trait.
///
/// This struct provides a concrete implementation of the `WebConfigRepository` trait.
#[derive(Debug, Clone)]
pub struct WebConfigRepositoryImpl {}

#[async_trait::async_trait]
impl WebConfigRepository for WebConfigRepositoryImpl {
    async fn fetch_parameter(&self, parameter_name: &str) -> Result<String, crate::error::Error> {
        let ssm_client = crate::cache::get_or_init_ssm_client().await;

        let parameter = ssm_client
            .get_parameter()
            .name(parameter_name)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("{}", e.to_string());
                crate::error::Error::SsmParameter(parameter_name.to_string())
            })?;

        let result = parameter
            .parameter
            .as_ref()
            .and_then(|p| p.value.as_ref())
            .ok_or_else(|| {
                tracing::error!("Parameter is not found: {}", parameter_name);
                crate::error::Error::SsmParameter(format!(
                    "Parameter is not found: {}",
                    parameter_name
                ))
            })?;

        Ok(result.clone())
    }
}
