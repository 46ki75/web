//! Initializes and returns axum router.

/// Initializes and returns axum router.
pub async fn init_router() -> Result<axum::Router, lambda_http::Error> {
    let config = crate::config::Config::init_config().await?;

    let blog_repository = std::sync::Arc::new(crate::repository::blog::BlogRepositoryImpl {
        config: config.clone(),
    });

    let blog_service = std::sync::Arc::new(crate::service::blog::BlogService { blog_repository });

    let blog_controller =
        std::sync::Arc::new(crate::controller::blog::BlogController { blog_service });

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
            axum::routing::get(
                |axum::extract::State(blog_controller): axum::extract::State<
                    std::sync::Arc<crate::controller::blog::BlogController>,
                >,
                 axum::extract::Path(page_id): axum::extract::Path<String>| async move {
                    blog_controller.handle_fetch_ogp_image(page_id).await
                },
            ),
        )
        .route(
            "/api/blog/image/block/{block_id}",
            axum::routing::get(
                |axum::extract::State(blog_controller): axum::extract::State<
                    std::sync::Arc<crate::controller::blog::BlogController>,
                >,
                 axum::extract::Path(block_id): axum::extract::Path<String>| async move {
                    blog_controller.handle_fetch_block_image(block_id).await
                },
            ),
        )
        .with_state(blog_controller.clone());

    Ok(app)
}
