//! Initializes and returns axum router.

use utoipa_axum::{router::OpenApiRouter, routes};

#[derive(Clone)]
pub struct BlogState {
    pub blog_use_case: std::sync::Arc<crate::blog::use_case::BlogUseCase>,
}

pub async fn init_blog_router(
) -> Result<(axum::Router, utoipa::openapi::OpenApi), crate::error::Error> {
    let blog_repository = crate::blog::repository::BlogRepositoryImpl {};
    let blog_use_case = crate::blog::use_case::BlogUseCase {
        blog_repository: std::sync::Arc::new(blog_repository),
    };

    let blog_state = std::sync::Arc::new(BlogState {
        blog_use_case: std::sync::Arc::new(blog_use_case),
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
