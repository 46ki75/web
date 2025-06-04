//! # Execute
//!
//! This module contains the Axum and GraphQL executors.

/// Execute an Axum app with a Lambda event.
#[tracing::instrument(level = "info")]
pub async fn execute_axum(
    app: axum::Router,
    event: http::Request<lambda_http::Body>,
) -> Result<http::Response<axum::body::Body>, lambda_http::Error> {
    let (lambda_parts, lambda_body) = event.into_parts();

    use tower::ServiceExt;
    let axum_response = app
        .oneshot(axum::http::Request::from_parts(lambda_parts, lambda_body))
        .await?;

    Ok(axum_response)
}
