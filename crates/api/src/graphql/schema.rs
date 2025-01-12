pub fn create_schema(
    event: &lambda_http::Request,
) -> async_graphql::Schema<
    super::query::QueryRoot,
    async_graphql::EmptyMutation,
    async_graphql::EmptySubscription,
> {
    async_graphql::Schema::build(
        super::query::QueryRoot,
        async_graphql::EmptyMutation,
        async_graphql::EmptySubscription,
    )
    .data(event.headers().clone())
    .finish()
}
