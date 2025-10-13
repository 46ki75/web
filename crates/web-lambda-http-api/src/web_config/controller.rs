#[utoipa::path(
    get,
    path = "/api/v2/web-config",
    responses(
        (status = 200, description = "WebConfig", body = super::response::WebConfigResponse),
        (status = 400, description = "Bad request", body = String)
    )
)]
pub async fn fetch_web_config(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let web_config_use_case = &state.web_config_use_case;

    let rum_identity_pool_id = web_config_use_case
        .fetch_rum_identity_pool_id()
        .await
        .map_err(|e| e.as_client_response())?;

    let rum_app_monitor_id = web_config_use_case
        .fetch_rum_app_monitor_id()
        .await
        .map_err(|e| e.as_client_response())?;

    let config = super::response::WebConfigResponse {
        rum_identity_pool_id,
        rum_app_monitor_id,
    };

    let json = match serde_json::to_string(&config) {
        Ok(j) => j,
        Err(e) => {
            return Err((
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to serialize response: {}", e),
            ));
        }
    };

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(axum::body::Body::from(json))
        .map_err(|e| {
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to build response: {}", e),
            )
        })?;

    Ok(response)
}
