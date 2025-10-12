//! Initializes and returns axum router.

static ROUTER: tokio::sync::OnceCell<axum::Router> = tokio::sync::OnceCell::const_new();

/// Initializes and returns axum router.
pub async fn init_router() -> anyhow::Result<&'static axum::Router> {
    ROUTER
        .get_or_try_init(|| async {
            let app = axum::Router::new()
                .route("/api/health", axum::routing::get(handle_health_check))
                .layer(tower_http::normalize_path::NormalizePathLayer::trim_trailing_slash())
                .layer(tower_http::catch_panic::CatchPanicLayer::new());

            Ok(app)
        })
        .await
}

async fn handle_health_check() -> impl axum::response::IntoResponse {
    #[derive(serde::Serialize)]
    struct Status {
        status: String,
    }

    axum::Json(Status {
        status: "ok".to_string(),
    })
}
