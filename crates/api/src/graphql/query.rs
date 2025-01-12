pub struct QueryRoot;

#[async_graphql::Object]
impl QueryRoot {
    async fn greet(&self) -> String {
        "Hello, world!".to_string()
    }

    pub async fn blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        slug: u64,
    ) -> Result<super::blog::query::Blog, async_graphql::Error> {
        super::blog::query::Blog::get_by_slug(ctx, slug).await
    }

    pub async fn blogs(
        &self,
        ctx: &async_graphql::Context<'_>,
        sort: Option<super::blog::query::SortDirection>,
    ) -> Result<Vec<super::blog::query::Blog>, async_graphql::Error> {
        super::blog::query::Blog::list(ctx, sort.unwrap_or_default()).await
    }

    pub async fn search_blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        keyword: String,
    ) -> Result<Vec<super::blog::query::Blog>, async_graphql::Error> {
        super::blog::query::Blog::search(ctx, keyword).await
    }
}
