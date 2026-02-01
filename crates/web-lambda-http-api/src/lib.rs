pub mod axum_router;
pub mod blog;
pub mod error;
pub mod execute_axum;
pub mod once_cell_cache;
pub mod talk;
pub mod web_config;

pub fn stage_name() -> Result<String, crate::error::Error> {
    let stage_name = std::env::var("STAGE_NAME").map_err(|_| {
        let error = crate::error::Error::EnvironmentVariableNotFound {
            variable_name: "STAGE_NAME".to_owned(),
        };
        tracing::error!("{}", error);
        error
    })?;
    Ok(stage_name)
}

pub fn domain_name() -> Result<String, crate::error::Error> {
    let stage_name = crate::stage_name()?;

    let domain = match stage_name.as_str() {
        "prod" => "www.ikuma.cloud",
        "staging" => "stg-www.ikuma.cloud",
        _ => "dev-www.ikuma.cloud",
    };
    Ok(domain.to_owned())
}

pub async fn function_handler(
    event: http::Request<lambda_http::Body>,
) -> Result<http::Response<axum::body::Body>, lambda_http::Error> {
    tracing::debug!("HTTP Request: {} {}", event.method(), event.uri().path());

    let app = crate::axum_router::init_router().await?;

    let response = crate::execute_axum::execute_axum(app.clone(), event).await?;

    Ok(response)
}
