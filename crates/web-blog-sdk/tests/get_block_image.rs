#[tokio::test]
async fn get_block_image() {
    dotenvy::dotenv().unwrap();

    let notion_api_key = std::env::var("NOTION_API_KEY").unwrap();
    let blog_image_block_id = std::env::var("BLOG_IMAGE_BLOCK_ID").unwrap();

    let notionrs_client = notionrs::Client::new(notion_api_key);

    let _bytes =
        web_blog_sdk::command::get_block_image::get_block_image(notionrs_client, &blog_image_block_id)
            .await
            .unwrap();
}
