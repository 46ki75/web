use std::{io::Cursor, str::FromStr};

use http::header::AUTHORIZATION;
use reqwest::Url;
use sitemap::reader::{SiteMapEntity, SiteMapReader};

use crate::{ssm::get_parameter, util::create_basic_auth_header_value};

pub fn extract_sitemap_url_from_robots<'a>(robotstxt: &'a str) -> Option<&'a str> {
    let re = regex::Regex::new(r#"(?m)^Sitemap:\s(https://.*?)$"#).unwrap();

    re.captures(robotstxt)
        .and_then(|captures| captures.get(1))
        .map(|m| m.as_str())
}

pub async fn parse_sitemap(
    sitemap_url: &str,
    authorization: Option<&str>,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let mut urls = Vec::new();
    let mut sitemap_entries = Vec::new();
    let mut errors = Vec::new();

    let entry_point = sitemap::structs::SiteMapEntry {
        loc: sitemap::structs::Location::Url(Url::from_str(sitemap_url)?),
        lastmod: sitemap::structs::LastMod::None,
    };

    sitemap_entries.push(entry_point);

    let client = reqwest::Client::new();

    while let Some(sitemap_entry) = sitemap_entries.pop() {
        let url = match sitemap_entry.loc.get_url() {
            Some(url) => url,
            None => break,
        };

        let sitemap = client
            .get(url)
            .header(
                AUTHORIZATION,
                authorization.map(|a| a.to_string()).unwrap_or_default(),
            )
            .send()
            .await?
            .text()
            .await?;

        let parser = SiteMapReader::new(Cursor::new(sitemap.as_bytes()));

        for entity in parser {
            match entity {
                SiteMapEntity::Url(url_entry) => {
                    if let Some(url) = url_entry.loc.get_url() {
                        urls.push(url.as_str().to_owned());
                    };
                }
                SiteMapEntity::SiteMap(sitemap_entry) => {
                    sitemap_entries.push(sitemap_entry);
                }
                SiteMapEntity::Err(error) => {
                    errors.push(error);
                }
            };
        }
    }

    Ok(urls)
}

pub async fn fetch_sitemap_urls(
    robotstxt_url: &str,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let authorization =
        get_parameter("/shared/46ki75/web/ssm/parameter/basic-auth/cache_warmer/password")
            .await
            .map(|password| create_basic_auth_header_value("cache_warmer", &password))
            .ok();

    let client = reqwest::Client::new();

    let robotstxt = client
        .get(robotstxt_url)
        .header(
            AUTHORIZATION,
            authorization
                .clone()
                .map(|a| a.to_string())
                .unwrap_or_default(),
        )
        .send()
        .await?
        .text()
        .await?;

    let sitemap_url = extract_sitemap_url_from_robots(&robotstxt)
        .ok_or("Failed to fetch the sitemap.".to_owned())?;

    let urls = parse_sitemap(sitemap_url, authorization.as_deref()).await?;

    Ok(urls)
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

        let sitemap_url = extract_sitemap_url_from_robots(robotstxt);

        assert_eq!(
            sitemap_url,
            Some("https://dev-www.ikuma.cloud/sitemap-index.xml")
        );
    }
}
