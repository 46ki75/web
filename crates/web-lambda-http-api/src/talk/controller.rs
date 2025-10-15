#[utoipa::path(
    get,
    path = "/api/v2/talks",
    responses(
        (status = 200, description = "Talks", body = Vec<super::response::TalkResponse>),
        (status = 400, description = "Bad request", body = String)
    )
)]
pub async fn list_talks(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let talks = match state.talk_use_case.list_talks().await {
        Ok(talk_entities) => {
            let response = talk_entities
                .into_iter()
                .map(|b| super::response::TalkResponse::from(b))
                .collect::<Vec<super::response::TalkResponse>>();

            let json = match serde_json::to_string(&response) {
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
        Err(e) => Err(e.as_client_response()),
    };

    talks
}
