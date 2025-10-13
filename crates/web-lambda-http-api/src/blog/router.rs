pub fn init_blog_router() -> axum::Router {
    let blog_repository = super::repository::BlogRepositoryImpl {};
    let blog_use_case = super::use_case::BlogUseCase {
        blog_repository: std::sync::Arc::new(blog_repository),
    };

    let router = axum::Router::new()
        .route("/", axum::routing::get(super::controller::list_blogs))
        .with_state(std::sync::Arc::new(blog_use_case));
    router
}
