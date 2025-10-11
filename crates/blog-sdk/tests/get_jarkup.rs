#[tokio::test]
async fn get_jarkup() {
    dotenvy::dotenv().unwrap();

    let notion_api_key = std::env::var("NOTION_API_KEY").unwrap();
    let data_source_id = std::env::var("BLOG_MASTER_DATA_SOURCE_ID").unwrap();
    let blog_page_slug = std::env::var("BLOG_PAGE_SLUG").unwrap();

    let notionrs_client = notionrs::Client::new(notion_api_key);
    let reqwest_client = reqwest::Client::new();

    let jarkup = blog_sdk::command::get_jarkup::get_jarkup(
        notionrs_client,
        reqwest_client,
        &data_source_id,
        &blog_page_slug,
        blog_sdk::types::Language::En,
    )
    .await
    .unwrap();

    println!("{:#?}", jarkup);
}
