pub mod config;
pub mod context;
pub mod controller;
pub mod entity;
pub mod error;
pub mod execute;
pub mod query;
pub mod record;
pub mod repository;
pub mod resolver;
pub mod service;

/// Thread-safe, write-once GraphQL schema.
static SCHEMA: tokio::sync::OnceCell<
    async_graphql::Schema<
        query::QueryRoot,
        async_graphql::EmptyMutation,
        async_graphql::EmptySubscription,
    >,
> = tokio::sync::OnceCell::const_new();

/// Initialize the GraphQL schema.
pub async fn init_schema(
    config: &crate::config::Config,
) -> Result<
    &'static async_graphql::Schema<
        query::QueryRoot,
        async_graphql::EmptyMutation,
        async_graphql::EmptySubscription,
    >,
    crate::error::Error,
> {
    SCHEMA
        .get_or_try_init(|| async {
            tracing::debug!("Initializing GraphQL schema");

            let blog_repository = std::sync::Arc::new(repository::blog::BlogRepositoryImpl {
                config: config.clone(),
            });

            let blog_service = service::blog::BlogService { blog_repository };

            let blog_query_resolver =
                std::sync::Arc::new(crate::resolver::blog::query::BlogQueryResolver {});

            let schema: async_graphql::Schema<
                query::QueryRoot,
                async_graphql::EmptyMutation,
                async_graphql::EmptySubscription,
            > = async_graphql::Schema::build(
                query::QueryRoot {
                    blog_query_resolver,
                },
                async_graphql::EmptyMutation,
                async_graphql::EmptySubscription,
            )
            .data(blog_service)
            .finish();
            Ok(schema)
        })
        .await
}

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
            "/api/blog/ogp/{page_id}",
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
            "/api/blog/block/{block_id}",
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
