//! Initializes and returns axum router.

/// Initializes and returns axum router.
pub async fn init_router() -> Result<axum::Router, lambda_http::Error> {
    let config = crate::config::Config::init_config().await?;

    let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryImpl {
        config: config.clone(),
    });

    let blog_service = std::sync::Arc::new(crate::service::blog::BlogService { blog_repository });

    let app = axum::Router::new()
        .route(
            "/api/health",
            axum::routing::get(|| async {
                #[derive(serde::Serialize)]
                struct Status {
                    status: String,
                }

                axum::Json(Status {
                    status: "ok".to_string(),
                })
            }),
        )
        .route(
            "/api/graphql",
            axum::routing::post(crate::graphql_handler::graphql_handler),
        )
        .route(
            "/api/blog/image/ogp/{page_id}",
            axum::routing::get(crate::controller::blog::handle_fetch_ogp_image),
        )
        .route(
            "/api/blog/image/block/{block_id}",
            axum::routing::get(crate::controller::blog::handle_fetch_ogp_image),
        )
        .with_state(blog_service);

    Ok(app)
}
