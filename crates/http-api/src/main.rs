#[tokio::main]
async fn main() -> Result<(), lambda_http::Error> {
    http_api::lambda_tracing_subscriber::init_subscriber();
    lambda_http::run(lambda_http::service_fn(http_api::function_handler)).await
}
