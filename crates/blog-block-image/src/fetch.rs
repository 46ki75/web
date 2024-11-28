pub async fn get_image_by_block_id(
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

pub async fn get_image_by_slug(
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
