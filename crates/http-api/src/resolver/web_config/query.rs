#![deny(missing_docs)]

//! Contains methods that resolve a web runtime config.

/// Contains methods that resolve a web runtime config.
#[derive(Debug, Default)]
pub struct WebConfigQueryResolver;

impl WebConfigQueryResolver {
    #[allow(missing_docs)]
    pub fn web_config(&self) -> WebConfig {
        WebConfig
    }
}

#[allow(missing_docs)]
pub struct WebConfig;

#[async_graphql::Object]
impl WebConfig {
    /// Cognito Identity Pool ID for CloudWatch RUM.
    pub async fn rum_identity_pool_id(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<String, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::web_config::WebConfigService>()?;

        let result = blog_service.fetch_rum_identity_pool_id().await?;

        Ok(result)
    }

    /// CloudWatch RUM App Monitor ID.
    pub async fn rum_app_monitor_id(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<String, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::web_config::WebConfigService>()?;

        let result = blog_service.fetch_rum_app_monitor_id().await?;

        Ok(result)
    }
}
