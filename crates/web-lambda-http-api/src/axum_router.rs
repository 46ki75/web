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
            Ok(router_with_blog(blog_router, blog_open_api))
        })
        .await
}

fn router_with_blog(
    blog_router: axum::Router,
    blog_open_api: utoipa::openapi::OpenApi,
) -> axum::Router {
    let (router, auto_generated_api) = OpenApiRouter::new()
        .routes(routes!(handle_health_check))
        .split_for_parts();

    let customized_api = ApiDoc::openapi()
        .merge_from(auto_generated_api)
        .merge_from(blog_open_api);

    router
        .merge(
            utoipa_swagger_ui::SwaggerUi::new("/api/v2/swagger-ui")
                .url("/api/v2/openapi.json", customized_api),
        )
        .merge(blog_router)
        .layer(
            tower_http::compression::CompressionLayer::new()
                .deflate(true)
                .gzip(true)
                .br(true)
                .zstd(true),
        )
        .layer(tower_http::catch_panic::CatchPanicLayer::new())
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

#[cfg(test)]
mod tests {
    use axum::body::{to_bytes, Body};
    use http::{Request, StatusCode};
    use tower::ServiceExt;
    use utoipa_axum::router::OpenApiRouter;

    #[tokio::test]
    async fn web_config_is_removed_from_the_router_and_openapi(
    ) -> Result<(), Box<dyn std::error::Error>> {
        let (blog_router, blog_api) = OpenApiRouter::new().split_for_parts();
        let router = super::router_with_blog(blog_router, blog_api);
        for (path, expected) in [
            ("/api/v2/web-config", StatusCode::NOT_FOUND),
            ("/api/health", StatusCode::OK),
            ("/api/v2/openapi.json", StatusCode::OK),
        ] {
            let response = router
                .clone()
                .oneshot(Request::builder().uri(path).body(Body::empty())?)
                .await?;
            assert_eq!(response.status(), expected, "{path}");
            if path == "/api/v2/openapi.json" {
                let body = to_bytes(response.into_body(), 64 * 1024).await?;
                let spec: serde_json::Value = serde_json::from_slice(&body)?;
                assert!(spec["paths"].get("/api/v2/web-config").is_none());
                assert!(spec["paths"].get("/api/health").is_some());
            }
        }
        Ok(())
    }
}
