use async_graphql::*;

pub struct QueryRoot;

use crate::resolvers;

#[async_graphql::Object]
impl QueryRoot {
    /// Returns a greeting message along with the programming language.
    pub async fn greet(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<resolvers::greet::Greet, async_graphql::Error> {
        resolvers::greet::Greet::new(ctx)
    }

    pub async fn get_blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        slug: String,
    ) -> Result<resolvers::blog::Blog, async_graphql::Error> {
        resolvers::blog::Blog::new(ctx, slug)
    }

    pub async fn list_blog(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<resolvers::blog::Blog>, async_graphql::Error> {
        resolvers::blog::Blog::list(ctx)
    }
}
