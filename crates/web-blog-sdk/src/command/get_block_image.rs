pub async fn get_block_image(
    notionrs_client: notionrs::Client,
    block_id: &str,
) -> Result<String, crate::error::Error> {
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

    Ok(url)
}
