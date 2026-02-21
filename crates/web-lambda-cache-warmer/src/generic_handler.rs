use lambda_runtime::{Error, LambdaEvent};
use serde::Deserialize;
use web_lambda_cache_warmer::{crawl_and_visit, create_basic_auth_header_value, ssm, Page};

#[derive(Deserialize)]
pub(crate) struct IncomingMessage {}

pub(crate) async fn function_handler(
    _event: LambdaEvent<IncomingMessage>,
) -> Result<Vec<Page>, Error> {
    let stage_name = std::env::var("STAGE_NAME").unwrap_or_else(|_| "dev".to_string());

    let authorization =
        ssm::get_parameter("/shared/46ki75/web/ssm/parameter/basic-auth/shirayuki/password")
            .await
            .map(|password| create_basic_auth_header_value(username, &password))?;

    let pages = crawl_and_visit(&stage_name, authorization.as_deref()).await?;

    Ok(pages)
}
