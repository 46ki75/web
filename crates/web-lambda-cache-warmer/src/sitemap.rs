fn extract_sitemap_url(robotstxt: &str) -> Option<&str> {
    let re = regex::Regex::new(r#"(?m)^Sitemap:\s(https://.*?)$"#).unwrap();

    re.captures(robotstxt)
        .and_then(|captures| captures.get(1))
        .map(|m| m.as_str())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_sitemap_url() {
        let robotstxt = r#"
User-agent: *
Disallow: /api/
Allow: /api/v2/blog/sitemap.xml

Sitemap: https://dev-www.ikuma.cloud/sitemap-index.xml
        "#;

        let sitemap_url = extract_sitemap_url(robotstxt);

        assert_eq!(
            sitemap_url,
            Some("https://dev-www.ikuma.cloud/sitemap-index.xml")
        );
    }
}
