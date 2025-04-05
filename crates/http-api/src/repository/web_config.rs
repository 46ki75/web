//! BlogRepository module
#![deny(missing_docs)]

/// Repository that fetches data regarding web frontend runtime config.
#[async_trait::async_trait]
pub trait WebConfigRepository {
    /// Get a current stage name (e.g, `dev``).
    fn get_stage_name(&self) -> String;

    /// Fetches a string parameter from SSM Parameter Store.
    async fn fetch_parameter(&self, parameter_name: &str) -> Result<String, crate::error::Error>;
}

/// Implementation of `WebConfigRepository` trait.
///
/// This struct provides a concrete implementation of the `WebConfigRepository` trait.
#[derive(Debug, Clone)]
pub struct WebConfigRepositoryImpl {
    /// The application configuration.
    pub config: crate::config::Config,
}

#[async_trait::async_trait]
impl WebConfigRepository for WebConfigRepositoryImpl {
    fn get_stage_name(&self) -> String {
        self.config.stage_name.clone()
    }

    async fn fetch_parameter(&self, parameter_name: &str) -> Result<String, crate::error::Error> {
        let parameter = self
            .config
            .ssm_client
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
