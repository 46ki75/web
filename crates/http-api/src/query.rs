//! Root Query object.

use async_graphql::*;

/// Root Query object.
pub struct QueryRoot {
    /// Instance of `BlogQueryResolver`. Injected at the entory point.
    pub blog_query_resolver: std::sync::Arc<crate::resolver::blog::query::BlogQueryResolver>,
}

#[async_graphql::Object]
impl QueryRoot {
    /// Returns a single blog post by page id.
    pub async fn blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        page_id: String,
    ) -> Result<crate::resolver::blog::query::Blog, async_graphql::Error> {
        self.blog_query_resolver.blog(ctx, page_id).await
    }

    /// Returns a list of blog posts.
    pub async fn blog_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<crate::resolver::blog::query::Blog>, async_graphql::Error> {
        self.blog_query_resolver.blog_list(ctx).await
    }

    /// Returns a single blog tag by tag id.
    pub async fn tag(
        &self,
        ctx: &async_graphql::Context<'_>,
        tag_id: String,
    ) -> Result<Option<crate::resolver::blog::query::BlogTag>, async_graphql::Error> {
        self.blog_query_resolver.tag(ctx, tag_id).await
    }

    /// Returns a list of blog tags.
    pub async fn tag_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<crate::resolver::blog::query::BlogTag>, async_graphql::Error> {
        self.blog_query_resolver.tag_list(ctx).await
    }
}
