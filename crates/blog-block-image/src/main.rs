use lambda_http::RequestExt;

/// e.g.
///
/// GET /?block_id={image_block_id}
async fn function_handler(
    event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    dotenvy::dotenv().ok();

    let query_params = event.query_string_parameters();
    let block_id_query = query_params.all("block_id");

    let block_id = match block_id_query {
        Some(queries) => {
            let url_query = queries.first();
            match url_query {
                Some(url) => url,
                None => {
                    return Ok(lambda_http::Response::builder()
                        .status(400)
                        .body("id not found".into())?)
                }
            }
            .to_string()
        }
        None => {
            return Ok(lambda_http::Response::builder()
                .status(400)
                .body("id not found".into())?)
        }
    };

    let notion_token = std::env::var("NOTION_API_KEY")?;
    let client = notionrs::Client::new().secret(notion_token);

    let request = client.get_block().block_id(block_id);

    let response = request.send().await?;

    let url = match response.block {
        notionrs::block::Block::Image { image } => image.get_url(),
        _ => {
            return Ok(lambda_http::Response::builder()
                .status(400)
                .body("image block not found".into())?)
        }
    };

    let client = reqwest::Client::new();

    let response = client.get(url).send().await?;

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
