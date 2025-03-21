use async_graphql::*;

/// The root query object.
pub struct QueryRoot {
    pub blog_query_resolver: std::sync::Arc<crate::resolver::blog::query::BlogQueryResolver>,
}

#[async_graphql::Object]
impl QueryRoot {
    /// Fetch a single blog post by page id.
    pub async fn blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        input: crate::resolver::blog::query::BlogInput,
    ) -> Result<crate::resolver::blog::query::Blog, async_graphql::Error> {
        self.blog_query_resolver.blog(ctx, input).await
    }

    /// Fetch a list of blog posts.
    pub async fn blog_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<crate::resolver::blog::query::Blog>, async_graphql::Error> {
        self.blog_query_resolver.blog_list(ctx).await
    }

    /// Fetch a single blog tag by tag id.
    pub async fn tag(
        &self,
        ctx: &async_graphql::Context<'_>,
        tag_id: String,
    ) -> Result<Option<crate::resolver::blog::query::BlogTag>, async_graphql::Error> {
        self.blog_query_resolver.tag(ctx, tag_id).await
    }

    /// Fetch a list of blog tags.
    pub async fn tag_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<crate::resolver::blog::query::BlogTag>, async_graphql::Error> {
        self.blog_query_resolver.tag_list(ctx).await
    }
}
