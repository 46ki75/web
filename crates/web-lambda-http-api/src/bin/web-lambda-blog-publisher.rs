//! Blog cache publisher Lambda.
//!
//! A generic-event Lambda that rebuilds the static blog cache in S3 from the
//! current Notion state. Invoke manually (`cargo lambda invoke` / `aws lambda
//! invoke`), on a schedule, or from a Notion webhook adapter — the rebuild is
//! idempotent regardless of trigger.

use lambda_runtime::{run, service_fn, tracing, Error, LambdaEvent};
use serde::{Deserialize, Serialize};

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
    summary: web_lambda_http_api::blog::publisher::RebuildSummary,
}

async fn function_handler(
    _event: LambdaEvent<Option<IncomingMessage>>,
) -> Result<OutgoingMessage, Error> {
    let summary = web_lambda_http_api::blog::publisher::rebuild_cache().await?;
    Ok(OutgoingMessage { ok: true, summary })
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    run(service_fn(function_handler)).await
}
