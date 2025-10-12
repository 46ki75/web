#[tokio::test]
async fn list_tags_en() {
    dotenvy::dotenv().unwrap();

    let notion_api_key = std::env::var("NOTION_API_KEY").unwrap();
    let data_source_id = std::env::var("BLOG_TAGS_DATA_SOURCE_ID").unwrap();

    let notionrs_client = notionrs::Client::new(notion_api_key);

    let tags = web_napi_sdk::command::list_tags::list_tags(notionrs_client, &data_source_id)
        .await
        .unwrap();

    println!("{:#?}", tags)
}
