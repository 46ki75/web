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
    let slug_query = query_params.all("slug");

    if block_id_query.is_none() && slug_query.is_none() {
        return Ok(lambda_http::Response::builder()
            .status(400)
            .body("block_id or slug not found".into())?);
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
                            .body("id not found".into())?)
                    }
                }
                .to_string();

                get_image_by_block_id(&block_id).await?
            }
            None => {
                return Ok(lambda_http::Response::builder()
                    .status(400)
                    .body("id not found".into())?)
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
                            .body("slug not found".into())?)
                    }
                }
                .to_string()
            }
            None => {
                return Ok(lambda_http::Response::builder()
                    .status(400)
                    .body("slug not found".into())?)
            }
        };

        let slug_number = match slug.parse::<u64>() {
            Ok(number) => number,
            Err(_) => {
                return Ok(lambda_http::Response::builder()
                    .status(400)
                    .body("slug is not a number".into())?)
            }
        };

        get_image_by_slug(slug_number).await?
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

async fn get_image_by_block_id(
    block_id: &str,
) -> Result<bytes::Bytes, Box<dyn std::error::Error + Send + Sync>> {
    dotenvy::dotenv().ok();

    let notion_token = std::env::var("NOTION_API_KEY")?;
    let client = notionrs::Client::new().secret(notion_token);

    let request = client.get_block().block_id(block_id);
    let response = request.send().await?;

    let url = match response.block {
        notionrs::block::Block::Image { image } => image.get_url(),
        _ => return Err("image block not found".into()),
    };

    let client = reqwest::Client::new();
    let response = client.get(url).send().await?;
    let bytes = response.bytes().await?;

    Ok(bytes)
}

async fn get_image_by_slug(
    slug: u64,
) -> Result<bytes::Bytes, Box<dyn std::error::Error + Send + Sync>> {
    dotenvy::dotenv().ok();

    let notion_token = std::env::var("NOTION_API_KEY")?;
    let database_id = std::env::var("NOTION_BLOG_DATABASE_ID")?;

    let client = notionrs::Client::new().secret(notion_token);

    let filter = notionrs::filter::Filter::unique_id_equals("slug", slug);

    let request = client
        .query_database()
        .database_id(database_id)
        .filter(filter);
    let response = request.send().await?;

    let result = response.results.first().ok_or("image not found")?;

    let images = result
        .properties
        .get("ogpImage")
        .ok_or("ogpImage property not found")?;

    let image = match images {
        notionrs::page::PageProperty::Files(files) => {
            files.files.first().ok_or("image not found")?
        }
        _ => return Err("image not found".into()),
    };

    let url = image.get_url();

    let client = reqwest::Client::new();
    let response = client.get(url).send().await?;
    let bytes = response.bytes().await?;

    Ok(bytes)
}

#[tokio::main]
async fn main() -> Result<(), lambda_http::Error> {
    lambda_http::tracing::init_default_subscriber();

    lambda_http::run(lambda_http::service_fn(function_handler)).await
}
