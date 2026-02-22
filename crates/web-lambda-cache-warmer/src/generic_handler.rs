use lambda_runtime::{Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use web_lambda_cache_warmer::{
    crawl_and_visit, ssm, util::create_basic_auth_header_value, FetchResult,
};

#[derive(Deserialize)]
pub(crate) struct IncomingMessage {}

#[derive(Serialize)]
pub(crate) struct OutgoingMessage {
    stat: Stat,
    errors: Vec<FetchResult>,
    success: Vec<FetchResult>,
}

#[derive(Serialize, Default)]
pub(crate) struct Stat {
    server_error: u32,
    client_error: u32,
    success: u32,
    cache_hit: u32,
    cache_miss: u32,
}

pub(crate) async fn function_handler(
    _event: LambdaEvent<Option<IncomingMessage>>,
) -> Result<OutgoingMessage, Error> {
    let stage_name = std::env::var("STAGE_NAME").unwrap_or_else(|_| "dev".to_string());

    let authorization =
        ssm::get_parameter("/shared/46ki75/web/ssm/parameter/basic-auth/cache_warmer/password")
            .await
            .map(|password| create_basic_auth_header_value("cache_warmer", &password))
            .ok();

    let pages = crawl_and_visit(&stage_name, authorization.as_deref()).await?;

    let mut stat = Stat::default();

    let mut errors = Vec::new();
    let mut success = Vec::new();

    for page in pages {
        if page.status >= 500 {
            stat.server_error += 1;
            errors.push(page);
        } else if page.status >= 400 {
            stat.client_error += 1;
            errors.push(page);
        } else {
            if page.is_cloudfront_cache_hit {
                stat.cache_hit += 1;
            } else {
                stat.cache_miss += 1;
            }

            stat.success += 1;
            success.push(page);
        }
    }

    Ok(OutgoingMessage {
        stat,
        errors,
        success,
    })
}
