use web_lambda_cache_warmer::sitemap::fetch_sitemap_urls;

#[tokio::test]
async fn test_parse_sitemap() {
    let urls = fetch_sitemap_urls().await.unwrap();

    assert!(!urls.is_empty());

    for url in urls {
        println!("{}", url);
    }
}
