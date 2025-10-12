use web_lambda_http_api;

#[tokio::main]
async fn main() -> Result<(), lambda_http::Error> {
    lambda_http::tracing::init_default_subscriber();

    lambda_http::run(lambda_http::service_fn(
        web_lambda_http_api::http_handler::function_handler,
    ))
    .await
}
