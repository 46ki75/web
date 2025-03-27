#![deny(missing_docs)]

//! // TODO: Write documentation for this crate.

pub mod config;
pub mod controller;
pub mod entity;
pub mod error;
pub mod execute;
pub mod query;
pub mod record;
pub mod repository;
pub mod resolver;
pub mod schema;
pub mod service;

/// Handler function of AWS Lambda.
pub async fn function_handler(
    event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    let config = crate::config::Config::init_config().await?;

    let blog_repository = std::sync::Arc::new(repository::blog::BlogRepositoryImpl {
        config: config.clone(),
    });

    let blog_service = std::sync::Arc::new(service::blog::BlogService { blog_repository });

    let blog_controller =
        std::sync::Arc::new(crate::controller::blog::BlogController { blog_service });

    tracing::debug!("HTTP Request: {} {}", event.method(), event.uri().path());

    let app = axum::Router::new()
        .route(
            "/api/graphql",
            axum::routing::post(crate::execute::graphql_handler),
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

    let response = crate::execute::execute_axum(app, event).await?;

    Ok(response)
}
