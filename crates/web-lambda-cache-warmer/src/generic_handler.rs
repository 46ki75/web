use lambda_runtime::{Error, LambdaEvent};
use serde::Deserialize;
use web_lambda_cache_warmer::{crawl_and_visit, create_basic_auth_header_value, Page};

#[derive(Deserialize)]
pub(crate) struct IncomingMessage {}

pub(crate) async fn function_handler(
    _event: LambdaEvent<IncomingMessage>,
) -> Result<Vec<Page>, Error> {
    let stage_name = std::env::var("STAGE_NAME").unwrap_or_else(|_| "dev".to_string());
    let username = std::env::var("USERNAME").ok();
    let password = std::env::var("PASSWORD").ok();

    let authorization = if let (Some(username), Some(password)) = (username, password) {
        Some(create_basic_auth_header_value(&username, &password))
    } else {
        None
    };

    let pages = crawl_and_visit(&stage_name, authorization.as_deref()).await?;

    Ok(pages)
}
