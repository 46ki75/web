use async_graphql::*;

pub struct QueryRoot {
    pub blog_query_resolver: std::sync::Arc<crate::resolver::blog::query::BlogQueryResolver>,
}

#[async_graphql::Object]
impl QueryRoot {
    pub async fn factorial(&self, number: u64) -> Result<u64, async_graphql::Error> {
        Ok((1..=number).product())
    }

    /// Returns a greeting message along with the programming language.
    pub async fn greet(&self) -> Result<Greet, async_graphql::Error> {
        Ok(Greet {
            message: "Hello, World!".to_string(),
            language: "Rust".to_string(),
        })
    }

    pub async fn blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        input: crate::resolver::blog::query::BlogInput,
    ) -> Result<crate::resolver::blog::query::Blog, async_graphql::Error> {
        self.blog_query_resolver.blog(ctx, input).await
    }

    pub async fn blog_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<crate::resolver::blog::query::Blog>, async_graphql::Error> {
        self.blog_query_resolver.blog_list(ctx).await
    }

    pub async fn tag(
        &self,
        ctx: &async_graphql::Context<'_>,
        tag_id: String,
    ) -> Result<Option<crate::resolver::blog::query::BlogTag>, async_graphql::Error> {
        self.blog_query_resolver.tag(ctx, tag_id).await
    }

    pub async fn tag_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<crate::resolver::blog::query::BlogTag>, async_graphql::Error> {
        self.blog_query_resolver.tag_list(ctx).await
    }
}

#[derive(async_graphql::SimpleObject)]
pub struct Greet {
    pub message: String,
    pub language: String,
}
