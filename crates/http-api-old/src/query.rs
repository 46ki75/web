//! Root Query object.

/// Root Query object.
#[derive(async_graphql::MergedObject, Default)]
pub struct QueryRoot(
    crate::resolver::blog::query::BlogQueryResolver,
    crate::resolver::web_config::query::WebConfigQueryResolver,
    crate::resolver::talk::query::TalkQueryResolver,
);
