//! Handles incoming GraphQL requests. Called by the axum route handler.

/// Handles incoming GraphQL requests. Called by the axum route handler.
pub async fn graphql_handler(
    body_bytes: axum::body::Bytes,
) -> Result<
    axum::response::Response<axum::body::Body>,
    (axum::http::StatusCode, axum::Json<serde_json::Value>),
> {
    let config = crate::config::Config::init_config().await.map_err(|_| {
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            axum::Json::from(serde_json::json!({"message": "Failed to initialize config."})),
        )
    })?;

    let schema = crate::schema::init_schema(config).await.map_err(|_| {
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            axum::Json::from(serde_json::json!({"message": "Failed to initialize schema."})),
        )
    })?;

    let gql_request = match serde_json::from_slice::<async_graphql::Request>(&body_bytes) {
        Ok(request) => request,
        Err(err) => {
            return Err((
                axum::http::StatusCode::BAD_REQUEST,
                axum::Json::from(
                    serde_json::json!({"message": format!("Invalid request body: {}", err)}),
                ),
            ));
        }
    };

    let gql_response = schema.execute(gql_request).await;

    match serde_json::to_string(&gql_response) {
        Ok(body) => {
            let response = axum::response::Response::builder()
                .status(200)
                .header("content-type", "application/json")
                .body(axum::body::Body::from(body));

            match response {
                Ok(r) => return Ok(r),
                Err(err) => {
                    return Err((
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        axum::Json::from(
                            serde_json::json!({"message": format!("Failed to serialize response: {}", err)}),
                        ),
                    ));
                }
            }
        }
        Err(err) => {
            lambda_http::tracing::error!("Failed to serialize response: {}", err);
            return Err((
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                axum::Json::from(
                    serde_json::json!({"message": format!("Failed to serialize response: {}", err)}),
                ),
            ));
        }
    };
}
