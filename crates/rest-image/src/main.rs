use lambda_http::RequestExt;

/// e.g.
///
/// GET /?url=https://example.com/image.jpg
async fn function_handler(
    event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    let url = event
        .query_string_parameters()
        .all("url")
        .unwrap()
        .first()
        .ok_or(lambda_http::Error::from("url not found"))?
        .to_string();

    let client = reqwest::Client::new();

    let response = client.get(&url).send().await?;

    let headers = response.headers();

    let content_type = headers
        .get("content-type")
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();

    let bytes = response.bytes().await?;

    let body = lambda_http::Body::Binary(bytes.to_vec());

    let response = lambda_http::Response::builder()
        .status(200)
        .header("content-type", content_type)
        .body(body)
        .map_err(Box::new)?;

    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), lambda_http::Error> {
    lambda_http::tracing::init_default_subscriber();

    lambda_http::run(lambda_http::service_fn(function_handler)).await
}
