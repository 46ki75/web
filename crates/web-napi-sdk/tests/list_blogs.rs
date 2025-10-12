#[tokio::test]
async fn list_blogs_en() {
    dotenvy::dotenv().unwrap();

    let notion_api_key = std::env::var("NOTION_API_KEY").unwrap();
    let data_source_id = std::env::var("BLOG_MASTER_DATA_SOURCE_ID").unwrap();

    let blog = web_napi_sdk::command::list_blogs::list_blogs(
        notion_api_key,
        data_source_id,
        web_napi_sdk::types::Language::En,
    )
    .await
    .unwrap();

    println!("{:#?}", blog)
}

#[tokio::test]
async fn list_blogs_ja() {
    dotenvy::dotenv().unwrap();

    let notion_api_key = std::env::var("NOTION_API_KEY").unwrap();
    let data_source_id = std::env::var("BLOG_MASTER_DATA_SOURCE_ID").unwrap();

    let blog = web_napi_sdk::command::list_blogs::list_blogs(
        notion_api_key,
        data_source_id,
        web_napi_sdk::types::Language::Ja,
    )
    .await
    .unwrap();

    println!("{:#?}", blog)
}
