#[tokio::test]
async fn list_blogs_en() {
    dotenvy::dotenv().unwrap();

    let notion_api_key = std::env::var("NOTION_API_KEY").unwrap();
    let data_source_id = std::env::var("BLOG_MASTER_DATA_SOURCE_ID").unwrap();

    let notionrs_client = notionrs::Client::new(notion_api_key);

    let blog = web_blog_sdk::command::list_blogs::list_blogs(
        notionrs_client,
        &data_source_id,
        web_blog_sdk::types::Language::En,
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

    let notionrs_client = notionrs::Client::new(notion_api_key);

    let blog = web_blog_sdk::command::list_blogs::list_blogs(
        notionrs_client,
        &data_source_id,
        web_blog_sdk::types::Language::Ja,
    )
    .await
    .unwrap();

    println!("{:#?}", blog)
}
