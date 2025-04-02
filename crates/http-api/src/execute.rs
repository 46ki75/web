//! # Execute
//!
//! This module contains the Axum and GraphQL executors.

use tower::ServiceExt;

/// Execute an Axum app with a Lambda event.
pub async fn execute_axum(
    app: axum::Router,
    event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    let mut axum_request = axum::extract::Request::builder()
        .method(event.method())
        .uri(event.uri());

    for (key, value) in event.headers() {
        axum_request = axum_request.header(key.as_str(), value.as_bytes());
    }

    let request = axum_request
        .body(axum::body::Body::from(event.body().to_vec()))
        .unwrap();

    let axum_response = app.oneshot(request).await?;

    let status = axum_response.status();
    let headers = axum_response.headers().clone();
    let body = axum_response.into_body();
    let body_bytes = axum::body::to_bytes(body, usize::MAX).await?;

    let mut lambda_response = lambda_http::Response::builder().status(status);

    for (key, value) in headers {
        if let Some(key) = key {
            lambda_response = lambda_response.header(key.as_str(), value.to_str().unwrap());
        }
    }

    Ok(lambda_response
        .body(lambda_http::Body::Binary(body_bytes.to_vec()))
        .map_err(Box::new)?)
}

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
