/// Errors produced by the web-config use-case layer.
#[derive(Debug, thiserror::Error)]
pub enum WebConfigUseCaseError {
    /// Wraps shared infrastructure failures (environment variables) that have
    /// no additional business meaning at this layer.
    #[error(transparent)]
    Internal(#[from] crate::error::Error),

    #[error(transparent)]
    Repository(#[from] super::repository::WebConfigRepositoryError),
}

pub struct WebConfigUseCase {
    pub web_config_repository:
        std::sync::Arc<dyn super::repository::WebConfigRepository + Send + Sync>,
}

impl WebConfigUseCase {
    pub async fn fetch_rum_identity_pool_id(&self) -> Result<String, WebConfigUseCaseError> {
        let stage_name = crate::stage_name()?;

        let parameter_name = format!("/{}/46ki75/web/cognito/id_pool/rum/id", stage_name);

        let parameter = self
            .web_config_repository
            .fetch_parameter(parameter_name)
            .await?;

        Ok(parameter)
    }

    pub async fn fetch_rum_app_monitor_id(&self) -> Result<String, WebConfigUseCaseError> {
        let stage_name = crate::stage_name()?;

        let parameter_name = format!("/{}/46ki75/web/rum/monitor/id", stage_name);

        let parameter = self
            .web_config_repository
            .fetch_parameter(parameter_name)
            .await?;

        Ok(parameter)
    }
}
