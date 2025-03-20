pub mod config;
pub mod context;
pub mod controller;
pub mod entity;
pub mod error;
pub mod query;
pub mod record;
pub mod repository;
pub mod resolver;
pub mod service;

static CONFIG: tokio::sync::OnceCell<crate::config::Config> = tokio::sync::OnceCell::const_new();
async fn init_config() -> Result<&'static crate::config::Config, crate::error::Error> {
    CONFIG
        .get_or_try_init(|| async {
            tracing::debug!("Initializing Config");

            let config = crate::config::Config::try_new_async().await?;
            Ok(config)
        })
        .await
}

static SCHEMA: tokio::sync::OnceCell<
    async_graphql::Schema<
        query::QueryRoot,
        async_graphql::EmptyMutation,
        async_graphql::EmptySubscription,
    >,
> = tokio::sync::OnceCell::const_new();
async fn init_schema(
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
    let config = init_config().await?;

    let schema = match init_schema(config).await {
        Ok(schema) => schema,
        Err(_err) => {
            return Ok(lambda_http::Response::builder()
                .status(500)
                .header("content-type", "application/json")
                .body(
                    serde_json::json!({"error": format!("Failed to initialize schema.")})
                        .to_string()
                        .into(),
                )
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    crate::error::Error::BuildResponse(e.to_string())
                })?);
        }
    };

    tracing::debug!("HTTP Request: {} {}", event.method(), event.uri().path());

    if event.uri().path() == "/api/graphql" {
        if event.method() == lambda_http::http::Method::POST {
            // GraphQL Execution
            let request_body = event.body();

            let gql_request = match serde_json::from_slice::<async_graphql::Request>(request_body) {
                Ok(request) => request,
                Err(err) => {
                    return Ok(lambda_http::Response::builder()
                        .status(400)
                        .header("content-type", "application/json")
                        .body(
                            serde_json::json!({"error": format!("Invalid request body: {}", err)})
                                .to_string()
                                .into(),
                        )
                        .map_err(|e| {
                            tracing::error!("Failed to build response: {}", e);
                            crate::error::Error::BuildResponse(e.to_string())
                        })?);
                }
            };

            let gql_response = schema.execute(gql_request).await;

            let response_body = match serde_json::to_string(&gql_response) {
                Ok(body) => body,
                Err(err) => {
                    tracing::error!("Failed to serialize response: {}", err);
                    return Ok(lambda_http::Response::builder()
                    .status(500)
                    .header("content-type", "application/json")
                    .body(
                        serde_json::json!({"error": format!("Failed to serialize response: {}", err)})
                            .to_string()
                            .into(),
                    )
                    .map_err(|e| {
                        tracing::error!("Failed to build response: {}", e);
                        crate::error::Error::BuildResponse(e.to_string())
                    })?);
                }
            };

            Ok(lambda_http::Response::builder()
                .status(200)
                .header("content-type", "application/json")
                .body(response_body.into())
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    crate::error::Error::BuildResponse(e.to_string())
                })?)
        } else {
            // Error Response - Method Not Allowed
            let response = lambda_http::Response::builder()
                .status(405)
                .header("content-type", "application/json")
                .body(
                    serde_json::json!({"error":"Method Not Allowed"})
                        .to_string()
                        .into(),
                )
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    crate::error::Error::BuildResponse(e.to_string())
                })?;
            Ok(response)
        }
    } else if event.uri().path().starts_with("/api/blog/ogp/") {
        let blog_repository = std::sync::Arc::new(repository::blog::BlogRepositoryImpl {
            config: config.clone(),
        });

        let blog_service = service::blog::BlogService { blog_repository };

        let blog_controller = crate::controller::blog::BlogController { blog_service };

        let response = blog_controller.fetch_ogp_image_by_id(event).await?;

        Ok(response)
    } else {
        tracing::info!("Not Found: {}", event.uri());
        let response = lambda_http::Response::builder()
            .status(404)
            .header("content-type", "application/json")
            .body(serde_json::json!({"error":"Not Found"}).to_string().into())
            .map_err(|e| {
                tracing::error!("Failed to build response: {}", e);
                crate::error::Error::BuildResponse(e.to_string())
            })?;
        Ok(response)
    }
}
