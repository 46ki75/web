use lambda_runtime::{Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use web_lambda_cache_warmer::{crawl, crawl_and_visit, visit, Page};

#[derive(Deserialize)]
pub(crate) struct IncomingMessage {}

#[derive(Deserialize)]
pub enum StageName {
    Dev,
    Stg,
    Prod,
}

#[derive(Serialize)]
pub(crate) struct OutgoingMessage {
    req_id: String,
}

pub(crate) async fn function_handler(
    event: LambdaEvent<IncomingMessage>,
) -> Result<Vec<Page>, Error> {
    let stage_name = std::env::var("STAGE_NAME")?;

    let pages = crawl_and_visit().await?;

    Ok(pages)
}
