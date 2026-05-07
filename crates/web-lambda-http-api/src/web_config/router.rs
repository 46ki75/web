//! Initializes and returns axum router.

use utoipa_axum::{router::OpenApiRouter, routes};

#[derive(Clone)]
pub struct WebConfigState {
    pub web_config_use_case: std::sync::Arc<crate::web_config::use_case::WebConfigUseCase>,
}

static ROUTER: tokio::sync::OnceCell<(axum::Router, utoipa::openapi::OpenApi)> =
    tokio::sync::OnceCell::const_new();

/// Initializes and returns axum router.
pub async fn init_web_config_router(
) -> Result<(&'static axum::Router, &'static utoipa::openapi::OpenApi), crate::error::Error> {
    ROUTER
        .get_or_try_init(|| async {
            let web_config_repository = crate::web_config::repository::WebConfigRepositoryImpl {};
            let web_config_use_case = crate::web_config::use_case::WebConfigUseCase {
                web_config_repository: std::sync::Arc::new(web_config_repository),
            };

            let web_config_state = std::sync::Arc::new(WebConfigState {
                web_config_use_case: std::sync::Arc::new(web_config_use_case),
            });

            let (router, auto_generated_api) = OpenApiRouter::new()
                .routes(routes!(crate::web_config::controller::fetch_web_config))
                .with_state(web_config_state)
                .split_for_parts();

            Ok((router, auto_generated_api))
        })
        .await
        .map(|tuple| (&tuple.0, &tuple.1))
}
