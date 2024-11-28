use lambda_http::RequestExt;

mod fetch;

/// e.g.
///
/// - GET /?block_id={image_block_id}
/// - GET /?slug={slug}
async fn function_handler(
    event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    dotenvy::dotenv().ok();

    let query_params = event.query_string_parameters();

    let block_id_query = query_params.all("block_id");
    let slug_query = query_params.all("slug");

    if block_id_query.is_none() && slug_query.is_none() {
        return Ok(lambda_http::Response::builder()
            .status(400)
            .body("block_id or slug not found".into())
            .map_err(Box::new)?);
    }

    let bytes = if block_id_query.is_some() {
        match block_id_query {
            Some(queries) => {
                let block_id_query = queries.first();
                let block_id = match block_id_query {
                    Some(url) => url,
                    None => {
                        return Ok(lambda_http::Response::builder()
                            .status(400)
                            .body("id not found".into())
                            .map_err(Box::new)?)
                    }
                }
                .to_string();

                fetch::get_image_by_block_id(&block_id).await?
            }
            None => {
                return Ok(lambda_http::Response::builder()
                    .status(400)
                    .body("id not found".into())
                    .map_err(Box::new)?)
            }
        }
    } else {
        let slug = match slug_query {
            Some(queries) => {
                let slug_query = queries.first();
                match slug_query {
                    Some(slug) => slug,
                    None => {
                        return Ok(lambda_http::Response::builder()
                            .status(400)
                            .body("slug not found".into())
                            .map_err(Box::new)?)
                    }
                }
                .to_string()
            }
            None => {
                return Ok(lambda_http::Response::builder()
                    .status(400)
                    .body("slug not found".into())
                    .map_err(Box::new)?)
            }
        };

        let slug_number = match slug.parse::<u64>() {
            Ok(number) => number,
            Err(_) => {
                return Ok(lambda_http::Response::builder()
                    .status(400)
                    .body("slug is not a number".into())
                    .map_err(Box::new)?)
            }
        };

        fetch::get_image_by_slug(slug_number).await?
    };

    let body = lambda_http::Body::Binary(bytes.to_vec());

    let content_type = infer::get(&bytes).map_or("application/octet-stream", |t| t.mime_type());

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
