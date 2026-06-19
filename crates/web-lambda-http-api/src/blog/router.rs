//! Initializes and returns axum router.

use utoipa_axum::{router::OpenApiRouter, routes};

/// Shared state for the blog read path.
///
/// The read path serves only pre-materialized objects from the blog cache
/// bucket — it makes no Notion calls. The (slow) Notion transform happens at
/// publish time in [`crate::blog::publisher`].
#[derive(Clone)]
pub struct BlogState {
    pub storage: std::sync::Arc<crate::blog::publisher::S3BlogStorage>,
}

pub async fn init_blog_router(
) -> Result<(axum::Router, utoipa::openapi::OpenApi), crate::error::Error> {
    let storage = crate::blog::publisher::S3BlogStorage::new().await?;

    let blog_state = std::sync::Arc::new(BlogState {
        storage: std::sync::Arc::new(storage),
    });

    let (router, auto_generated_api) = OpenApiRouter::new()
        .routes(routes!(crate::blog::controller::list_blogs))
        .routes(routes!(crate::blog::controller::get_blog_contents))
        .routes(routes!(crate::blog::controller::list_tags))
        .routes(routes!(crate::blog::controller::get_blog_og_image))
        .routes(routes!(crate::blog::controller::get_blog_block_image))
        .routes(routes!(crate::blog::controller::get_blog_sitemap))
        .routes(routes!(crate::blog::controller::get_blog_rss_feed))
        .routes(routes!(crate::blog::controller::get_blog_atom_feed))
        .routes(routes!(crate::blog::controller::get_blog_json_feed))
        .with_state(blog_state)
        .split_for_parts();

    Ok((router, auto_generated_api))
}
