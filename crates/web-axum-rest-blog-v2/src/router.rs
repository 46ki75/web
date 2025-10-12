pub async fn init_blog_router() -> anyhow::Result<axum::Router> {
    let app = axum::Router::new().route(
        "/",
        axum::routing::get(move || async move {
            axum::Json(serde_json::json!({"message":"Hello, world!"}))
        }),
    );

    Ok(app)
}
