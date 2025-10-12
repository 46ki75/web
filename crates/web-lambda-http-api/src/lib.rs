pub mod axum_router;
pub mod blog;
pub mod execute_axum;
pub mod once_cell_cache;

pub async fn function_handler(
    event: http::Request<lambda_http::Body>,
) -> Result<http::Response<axum::body::Body>, lambda_http::Error> {
    tracing::debug!("HTTP Request: {} {}", event.method(), event.uri().path());

    let app = crate::axum_router::init_router().await?;

    let response = crate::execute_axum::execute_axum(app.clone(), event).await?;

    Ok(response)
}
