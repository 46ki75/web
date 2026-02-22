use web_lambda_cache_warmer::sitemap::fetch_sitemap_urls;

#[tokio::test]
async fn test_parse_sitemap() {
    let robotstxt_url = "https://dev-www.ikuma.cloud/robots.txt";

    let urls = fetch_sitemap_urls(robotstxt_url).await.unwrap();

    assert!(!urls.is_empty());

    for url in urls {
        println!("{}", url);
    }
}
