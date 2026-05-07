//! Initializes and returns axum router.

use utoipa::OpenApi;
use utoipa_axum::{router::OpenApiRouter, routes};

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
pub async fn init_router() -> Result<&'static axum::Router, crate::error::Error> {
    ROUTER
        .get_or_try_init(|| async {
            let (blog_router, blog_open_api) = crate::blog::router::init_blog_router().await?;
            let (web_config_router, web_config_open_api) =
                crate::web_config::router::init_web_config_router().await?;

            let (router, auto_generated_api) = OpenApiRouter::new()
                .routes(routes!(handle_health_check))
                .split_for_parts();

            let customized_api = ApiDoc::openapi()
                .merge_from(auto_generated_api)
                .merge_from(blog_open_api)
                .merge_from(web_config_open_api);

            let app = router
                .merge(
                    utoipa_swagger_ui::SwaggerUi::new("/api/v2/swagger-ui")
                        .url("/api/v2/openapi.json", customized_api),
                )
                .merge(blog_router.to_owned())
                .merge(web_config_router.to_owned())
                .layer(
                    tower_http::compression::CompressionLayer::new()
                        .deflate(true)
                        .gzip(true)
                        .br(true)
                        .zstd(true),
                )
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
