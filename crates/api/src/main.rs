mod graphql;
mod rest;

async fn function_handler(
    event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    dotenvy::dotenv().ok();

    if event.uri().path() == "/" {
        Ok(rest::handler::not_found_handler(event).await?)
    } else if event.uri().path() == "/api/graphql" {
        if event.method() == lambda_http::http::Method::GET {
            // GraphQL API (playground)
            Ok(graphql::handler::graphql_playground_handler(event).await?)
        } else if event.method() == lambda_http::http::Method::POST {
            // GraphQL API (execution)
            Ok(graphql::handler::graphql_execution_handler(event).await?)
        } else {
            // GraphQL API (Method Not Allowed)
            Ok(graphql::handler::method_not_allowed_handler(event).await?)
        }
    } else if event.uri().path() == "/api" {
        // REST API
        Ok(rest::handler::rest_router_handler(event).await?)
    } else if event.uri().path().starts_with("/api/blog/image/") {
        Ok(rest::blog::controller::BlogController::blog_block_image(event).await?)
    } else {
        // Not Found
        Ok(rest::handler::not_found_handler(event).await?)
    }
}

#[tokio::main]
async fn main() -> Result<(), lambda_http::Error> {
    lambda_http::tracing::init_default_subscriber();
    lambda_http::run(lambda_http::service_fn(function_handler)).await
}
