use lambda_runtime::{Error, LambdaEvent};
use serde::Deserialize;
use web_lambda_cache_warmer::{crawl_and_visit, Page};

#[derive(Deserialize)]
pub(crate) struct IncomingMessage {}

pub(crate) async fn function_handler(
    _event: LambdaEvent<IncomingMessage>,
) -> Result<Vec<Page>, Error> {
    let pages = crawl_and_visit().await?;

    Ok(pages)
}
