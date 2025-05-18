#![deny(missing_docs)]

//! GraphQL schema that contains `Context`.

/// Thread-safe, write-once GraphQL schema.
static SCHEMA: tokio::sync::OnceCell<
    async_graphql::Schema<
        crate::query::QueryRoot,
        async_graphql::EmptyMutation,
        async_graphql::EmptySubscription,
    >,
> = tokio::sync::OnceCell::const_new();

/// Initializes the GraphQL schema.
pub async fn init_schema() -> Result<
    &'static async_graphql::Schema<
        crate::query::QueryRoot,
        async_graphql::EmptyMutation,
        async_graphql::EmptySubscription,
    >,
    crate::error::Error,
> {
    SCHEMA
        .get_or_try_init(|| async {
            tracing::debug!("Initializing GraphQL schema");

            let web_config_repository =
                std::sync::Arc::new(crate::repository::web_config::WebConfigRepositoryImpl {});

            let web_config_service = crate::service::web_config::WebConfigService {
                web_config_repository,
            };

            let web_config_query_resolver =
                std::sync::Arc::new(crate::resolver::web_config::query::WebConfigQueryResolver {});

            let blog_repository =
                std::sync::Arc::new(crate::repository::blog::BlogRepositoryImpl {});

            let blog_service = crate::service::blog::BlogService { blog_repository };

            let blog_query_resolver =
                std::sync::Arc::new(crate::resolver::blog::query::BlogQueryResolver {});

            let schema: async_graphql::Schema<
                crate::query::QueryRoot,
                async_graphql::EmptyMutation,
                async_graphql::EmptySubscription,
            > = async_graphql::Schema::build(
                crate::query::QueryRoot {
                    blog_query_resolver,
                    web_config_query_resolver,
                },
                async_graphql::EmptyMutation,
                async_graphql::EmptySubscription,
            )
            .data(blog_service)
            .data(web_config_service)
            .finish();
            Ok(schema)
        })
        .await
}
