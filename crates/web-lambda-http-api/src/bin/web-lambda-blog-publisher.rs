//! Blog cache publisher Lambda.
//!
//! A generic-event Lambda that rebuilds the static blog cache in S3 from the
//! current Notion state. Invoke manually (`cargo lambda invoke` / `aws lambda
//! invoke`), on a schedule, or from a Notion webhook adapter — the rebuild is
//! idempotent regardless of trigger.

use lambda_runtime::{run, service_fn, tracing, Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use web_lambda_http_api::blog::notion_config::{NotionConfig, NotionConfigError};
use web_lambda_http_api::blog::publisher::{rebuild_cache, RebuildSummary};
use web_lambda_http_api::once_cell_cache::ssm_parameter::try_get_ssm_parameter_async;

/// Optional invocation payload. `action` is accepted for forward-compatibility
/// (e.g. `{"action":"rebuild"}`) but the only supported behavior today is a full
/// rebuild, so the field is currently ignored.
#[derive(Debug, Deserialize)]
struct IncomingMessage {
    #[allow(dead_code)]
    #[serde(default)]
    action: Option<String>,
}

#[derive(Serialize)]
struct OutgoingMessage {
    ok: bool,
    summary: RebuildSummary,
}

async fn lambda_notion_config() -> Result<NotionConfig, Error> {
    match NotionConfig::from_env() {
        Ok(config) => return Ok(config),
        Err(NotionConfigError::NotConfigured) => {}
        Err(error) => return Err(error.into()),
    }

    // Keep deployed Lambdas compatible until publishing moves off Lambda.
    // Partial environment configuration is an error, never mixed with SSM.
    let stage = web_lambda_http_api::stage_name()?;
    let path = |suffix| format!("/{stage}/46ki75/web/ssm/parameter/notion/{suffix}");
    let (token, articles, tags) = tokio::try_join!(
        try_get_ssm_parameter_async(path("secret")),
        try_get_ssm_parameter_async(path("data_source/id/blog-article-master")),
        try_get_ssm_parameter_async(path("data_source/id/blog-tag")),
    )?;
    Ok(NotionConfig::new(token, articles, tags)?)
}

async fn function_handler(
    _event: LambdaEvent<Option<IncomingMessage>>,
) -> Result<OutgoingMessage, Error> {
    let summary = rebuild_cache(lambda_notion_config().await?).await?;
    Ok(OutgoingMessage { ok: true, summary })
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    if std::env::args_os()
        .nth(1)
        .is_some_and(|arg| arg == "--once")
    {
        let summary = rebuild_cache(NotionConfig::from_env()?).await?;
        println!("{}", serde_json::to_string(&summary)?);
        return Ok(());
    }

    run(service_fn(function_handler)).await
}
