static ROUTER: tokio::sync::OnceCell<axum::Router> = tokio::sync::OnceCell::const_new();

pub async fn init_blog_router() -> anyhow::Result<&'static axum::Router> {
    ROUTER
        .get_or_try_init(|| async {
            let app = axum::Router::new().route(
                "/",
                axum::routing::get(move || async move {
                    axum::Json(serde_json::json!({"message":"Hello, world!"}))
                }),
            );

            Ok(app)
        })
        .await
}
