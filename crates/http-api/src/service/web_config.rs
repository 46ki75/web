//! Service that invokes repository methods and executes business logic

/// Service that invokes repository methods and executes business logic
pub struct WebConfigService {
    /// Instance of WebConfigRepository. Injected at the entry point.
    pub web_config_repository:
        std::sync::Arc<dyn crate::repository::web_config::WebConfigRepository + Send + Sync>,
}

impl WebConfigService {
    /// Fetches a Cognito Identity Pool ID for CloudWatch RUM from AWS SSM Parameter Store.
    pub async fn fetch_rum_identity_pool_id(&self) -> Result<String, crate::error::Error> {
        let stage_name = crate::cache::get_or_init_stage_name().await?;

        let parameter_name = format!("/{}/46ki75/web/cognito/id_pool/rum/id", stage_name);

        let result = self
            .web_config_repository
            .fetch_parameter(&parameter_name)
            .await?;

        Ok(result)
    }

    /// Fetches a CloudWatch RUM App Monitor ID from AWS SSM Parameter Store.
    pub async fn fetch_rum_app_monitor_id(&self) -> Result<String, crate::error::Error> {
        let stage_name = crate::cache::get_or_init_stage_name().await?;

        let parameter_name = format!("/{}/46ki75/web/rum/monitor/id", stage_name);

        let result = self
            .web_config_repository
            .fetch_parameter(&parameter_name)
            .await?;

        Ok(result)
    }
}
