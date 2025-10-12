#[napi_derive::napi]
pub async fn get_block_image(
    notion_api_key: String,
    block_id: String,
) -> Result<Vec<u8>, crate::error::Error> {
    let notionrs_client = notionrs::Client::new(notion_api_key);

    let request = notionrs_client.get_block().block_id(block_id);

    let response = request.send().await?;

    let url = match response.block {
        notionrs_types::object::block::Block::Image { image } => image.get_url(),
        _ => {
            return Err(crate::error::Error::NotionInvalidSchema(
                "The requested block is not an Image block.".to_string(),
            ));
        }
    };

    let response = reqwest::get(url).await?;

    let bytes = response.bytes().await?;

    Ok(bytes.to_vec())
}
