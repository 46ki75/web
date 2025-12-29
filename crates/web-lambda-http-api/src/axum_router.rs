//! Initializes and returns axum router.

use utoipa::OpenApi;
use utoipa_axum::{router::OpenApiRouter, routes};

#[derive(Clone)]
pub struct AxumAppState {
    pub blog_use_case: std::sync::Arc<crate::blog::use_case::BlogUseCase>,
    pub web_config_use_case: std::sync::Arc<crate::web_config::use_case::WebConfigUseCase>,
    pub talk_use_case: std::sync::Arc<crate::talk::use_case::TalkUseCase>,
}

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
            let blog_repository = crate::blog::repository::BlogRepositoryImpl {};
            let blog_use_case = crate::blog::use_case::BlogUseCase {
                blog_repository: std::sync::Arc::new(blog_repository),
            };

            let web_config_repository = crate::web_config::repository::WebConfigRepositoryImpl {};
            let web_config_use_case = crate::web_config::use_case::WebConfigUseCase {
                web_config_repository: std::sync::Arc::new(web_config_repository),
            };

            let talk_repository = crate::talk::repository::TalkRepositoryImpl {};
            let talk_use_case = crate::talk::use_case::TalkUseCase {
                talk_repository: std::sync::Arc::new(talk_repository),
            };

            let app_state = std::sync::Arc::new(AxumAppState {
                blog_use_case: std::sync::Arc::new(blog_use_case),
                web_config_use_case: std::sync::Arc::new(web_config_use_case),
                talk_use_case: std::sync::Arc::new(talk_use_case),
            });

            let (router, auto_generated_api) = OpenApiRouter::new()
                .routes(routes!(handle_health_check))
                .routes(routes!(crate::blog::controller::list_blogs))
                .routes(routes!(crate::blog::controller::get_blog_contents))
                .routes(routes!(crate::blog::controller::list_tags))
                .routes(routes!(crate::blog::controller::get_blog_og_image))
                .routes(routes!(crate::blog::controller::get_blog_block_image))
                .routes(routes!(crate::web_config::controller::fetch_web_config))
                .routes(routes!(crate::talk::controller::list_talks))
                .with_state(app_state)
                .split_for_parts();

            let customized_api = ApiDoc::openapi().merge_from(auto_generated_api);

            let cors = tower_http::cors::CorsLayer::new()
                // Allow specific methods
                .allow_methods([http::Method::GET, http::Method::HEAD, http::Method::OPTIONS])
                // Allow requests from any origin
                .allow_origin(tower_http::cors::AllowOrigin::list(["http://localhost:*"
                    .parse()
                    .unwrap()]));

            let app = router
                .merge(
                    utoipa_swagger_ui::SwaggerUi::new("/api/v2/swagger-ui")
                        .url("/api/v2/openapi.json", customized_api),
                )
                .layer(
                    tower_http::compression::CompressionLayer::new()
                        .deflate(true)
                        .gzip(true)
                        .br(true)
                        .zstd(true),
                )
                .layer(tower_http::catch_panic::CatchPanicLayer::new())
                .layer(cors);

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
