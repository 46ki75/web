use lambda_http::RequestExt;

/// e.g.
///
/// GET /?url=https://example.com/image.jpg
async fn function_handler(
    event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    let query_params = event.query_string_parameters();
    let query = query_params.all("url");

    let url = match query {
        Some(queries) => {
            let url_query = queries.first();
            match url_query {
                Some(url) => url,
                None => {
                    return Ok(lambda_http::Response::builder()
                        .status(400)
                        .body("url not found".into())?)
                }
            }
            .to_string()
        }
        None => {
            return Ok(lambda_http::Response::builder()
                .status(400)
                .body("url not found".into())?)
        }
    };

    let client = reqwest::Client::new();

    let response = client.get(&url).send().await?;

    let headers = response.headers().clone();

    let bytes = response.bytes().await?;

    let body = lambda_http::Body::Binary(bytes.to_vec());

    let content_type = headers
        .get("content-type")
        .unwrap()
        .to_str()
        .unwrap_or_else(|_| {
            infer::get(&bytes).map_or("application/octet-stream", |t| t.mime_type())
        });

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
