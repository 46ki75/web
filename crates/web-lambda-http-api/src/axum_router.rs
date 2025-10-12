//! Initializes and returns axum router.

use utoipa::OpenApi;
use utoipa_axum::{router::OpenApiRouter, routes};
use utoipa_swagger_ui::SwaggerUi;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "web-lambda-http-api",
        version = "1.0.0",
        description = "API description",
        contact(name = "Ikuma Yamashita", email = "me@ikuma.cloud"),
        license(name = "GPL-3.0")
    ),
    paths(handle_health_check),
    components(schemas(HealthStatus))
)]
struct ApiDoc;

static ROUTER: tokio::sync::OnceCell<axum::Router> = tokio::sync::OnceCell::const_new();

/// Initializes and returns axum router.
pub async fn init_router() -> anyhow::Result<&'static axum::Router> {
    ROUTER
        .get_or_try_init(|| async {
            let (router, auto_generated_api) = OpenApiRouter::new()
                .routes(routes!(handle_health_check))
                .split_for_parts();

            let customized_api = ApiDoc::openapi().merge_from(auto_generated_api);

            let app = router
                .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", customized_api))
                .layer(tower_http::normalize_path::NormalizePathLayer::trim_trailing_slash())
                .layer(tower_http::catch_panic::CatchPanicLayer::new());

            Ok(app)
        })
        .await
}

#[derive(utoipa::ToSchema, serde::Serialize)]
struct HealthStatus {
    status: String,
}

#[utoipa::path(
    get,
    path = "/api/health",
    responses(
        (status = 200, description = "Health check successful", body = HealthStatus)
    )
)]
async fn handle_health_check() -> impl axum::response::IntoResponse {
    axum::Json(HealthStatus {
        status: "ok".to_string(),
    })
}
