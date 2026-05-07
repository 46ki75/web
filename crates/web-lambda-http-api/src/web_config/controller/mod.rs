pub mod response;

/// Errors produced by the web-config controller layer.
///
/// This is the single place that decides HTTP status codes and log emission for
/// the web-config feature.
#[derive(Debug, thiserror::Error)]
pub enum WebConfigControllerError {
    #[error(transparent)]
    UseCase(#[from] super::use_case::WebConfigUseCaseError),

    #[error("response serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("response build error: {0}")]
    ResponseBuild(#[from] http::Error),
}

impl axum::response::IntoResponse for WebConfigControllerError {
    fn into_response(self) -> axum::response::Response {
        tracing::error!(error = ?self, "request failed");
        let body = serde_json::json!({ "error": self.to_string() });
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            axum::Json(body),
        )
            .into_response()
    }
}

#[utoipa::path(
    get,
    path = "/api/v2/web-config",
    tag = "web-config",
    responses(
        (status = 200, description = "WebConfig", body = response::WebConfigResponse),
        (status = 500, description = "Internal error"),
    )
)]
pub async fn fetch_web_config(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::WebConfigState>>,
) -> Result<axum::response::Response<axum::body::Body>, WebConfigControllerError> {
    let web_config_use_case = &state.web_config_use_case;

    let rum_identity_pool_id = web_config_use_case.fetch_rum_identity_pool_id().await?;
    let rum_app_monitor_id = web_config_use_case.fetch_rum_app_monitor_id().await?;

    let config = response::WebConfigResponse {
        rum_identity_pool_id,
        rum_app_monitor_id,
    };

    let json = serde_json::to_string(&config)?;

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(axum::body::Body::from(json))?;

    Ok(response)
}
