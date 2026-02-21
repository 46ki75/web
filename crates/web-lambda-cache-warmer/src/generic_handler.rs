use lambda_runtime::{Error, LambdaEvent};
use serde::Deserialize;
use web_lambda_cache_warmer::{
    crawl_and_visit, ssm, util::create_basic_auth_header_value, FetchResult,
};

#[derive(Deserialize)]
pub(crate) struct IncomingMessage {}

pub(crate) async fn function_handler(
    _event: LambdaEvent<Option<IncomingMessage>>,
) -> Result<Vec<FetchResult>, Error> {
    let stage_name = std::env::var("STAGE_NAME").unwrap_or_else(|_| "dev".to_string());

    let authorization =
        ssm::get_parameter("/shared/46ki75/web/ssm/parameter/basic-auth/cache_warmer/password")
            .await
            .map(|password| create_basic_auth_header_value("cache_warmer", &password))
            .ok();

    let pages = crawl_and_visit(&stage_name, authorization.as_deref()).await?;

    Ok(pages
        .into_iter()
        .filter(|page| page.status >= 400)
        .collect())
}
