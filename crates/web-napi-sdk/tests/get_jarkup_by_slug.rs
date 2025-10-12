#[tokio::test]
async fn get_jarkup_by_slug() {
    dotenvy::dotenv().unwrap();

    let notion_api_key = std::env::var("NOTION_API_KEY").unwrap();
    let data_source_id = std::env::var("BLOG_MASTER_DATA_SOURCE_ID").unwrap();
    let blog_page_slug = std::env::var("BLOG_PAGE_SLUG").unwrap();

    let jarkup = web_napi_sdk::command::get_jarkup_by_slug::get_jarkup_by_slug(
        notion_api_key,
        data_source_id,
        blog_page_slug,
        web_napi_sdk::types::Language::En,
    )
    .await
    .unwrap();

    println!("{:#?}", jarkup);
}
