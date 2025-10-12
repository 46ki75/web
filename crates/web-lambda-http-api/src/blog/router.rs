pub fn init_blog_router() -> anyhow::Result<axum::Router> {
    let router = axum::Router::new();

    Ok(router)
}
