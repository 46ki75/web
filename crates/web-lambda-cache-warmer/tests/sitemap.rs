use http::header::AUTHORIZATION;
use web_lambda_cache_warmer::{
    sitemap::{extract_sitemap_url_from_robots, parse_sitemap},
    ssm::get_parameter,
    util::create_basic_auth_header_value,
};

#[tokio::test]
async fn test_parse_sitemap() {
    let authorization =
        get_parameter("/shared/46ki75/web/ssm/parameter/basic-auth/cache_warmer/password")
            .await
            .map(|password| create_basic_auth_header_value("cache_warmer", &password))
            .ok();

    let client = reqwest::Client::new();

    let robotstxt = client
        .get("https://dev-www.ikuma.cloud/robots.txt")
        .header(
            AUTHORIZATION,
            authorization
                .clone()
                .map(|a| a.to_string())
                .unwrap_or_default(),
        )
        .send()
        .await
        .unwrap()
        .text()
        .await
        .unwrap();

    let sitemap_url = extract_sitemap_url_from_robots(&robotstxt).unwrap();

    let urls = parse_sitemap(sitemap_url, authorization.as_deref())
        .await
        .unwrap();

    assert!(!urls.is_empty());

    for url in urls {
        println!("{}", url);
    }
}
