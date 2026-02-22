use web_lambda_cache_warmer::sitemap::fetch_sitemap_urls;

#[tokio::test]
async fn test_parse_sitemap() {
    let base_domain = "dev-www.ikuma.cloud";

    let urls = fetch_sitemap_urls(base_domain).await.unwrap();

    assert!(!urls.is_empty());

    for url in urls {
        println!("{}", url);
    }
}
