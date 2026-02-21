pub mod ssm;

use base64::prelude::*;
use std::collections::HashMap;

pub fn get_base_domain(stage_name: &str) -> String {
    match stage_name {
        "prod" => "www.ikuma.cloud".to_owned(),
        _ => format!("{}-www.ikuma.cloud", stage_name),
    }
}

pub fn create_basic_auth_header_value(username: &str, password: &str) -> String {
    let credentials = format!("{}:{}", username, password);
    let encoded_credentials = BASE64_STANDARD.encode(credentials);
    format!("Basic {}", encoded_credentials)
}

#[derive(Debug, Default, Clone, serde::Serialize)]
pub struct Page {
    pub path: String,
    pub body: Option<String>,
    pub status: u16,
    pub visited: bool,
    pub is_cloudfront_cache_hit: bool,
}

pub fn report(pages: &HashMap<String, Page>) {
    println!("Visited {} pages", pages.len());

    for (path, page) in pages {
        println!(
            "| {} | {} | {}",
            if page.is_cloudfront_cache_hit {
                "HIT "
            } else {
                "MISS"
            },
            page.status,
            path
        );
    }
}

pub async fn visit(path: &str, stage_name: &str, authorization: Option<&str>) -> Page {
    let base_domain = get_base_domain(stage_name);

    let client = reqwest::Client::new();
    let url = if path.starts_with("http://") || path.starts_with("https://") {
        path.to_owned()
    } else if path.starts_with("//") {
        format!("https:{}", path)
    } else if path.starts_with('/') {
        format!("https://{}{}", base_domain, path)
    } else {
        format!("https://{}/{}", base_domain, path)
    };

    let only_path = url
        .replace(&format!("https://{}", base_domain), "")
        .to_owned();

    tracing::info!("Visiting {}", only_path);

    let mut req = client.get(&url);
    if let Some(auth) = authorization {
        req = req.header(http::header::AUTHORIZATION, auth);
    }

    let response = match req.send().await {
        Ok(r) => r,
        Err(e) => {
            tracing::error!("Request failed for {}: {}", url, e);
            return Page {
                path: path.to_owned(),
                body: None,
                status: 0,
                ..Default::default()
            };
        }
    };

    let status = response.status();

    let is_cloudfront_cache_hit = response
        .headers()
        .get("x-cache")
        .and_then(|v| v.to_str().ok())
        .map(|v| v.contains("Hit"))
        .unwrap_or_default();

    let body = match response.text().await {
        Ok(t) => Some(t),
        Err(e) => {
            tracing::error!("Failed reading body for {}: {}", url, e);
            None
        }
    };

    tracing::info!(
        "| {} | {} | {}",
        if is_cloudfront_cache_hit {
            "HIT "
        } else {
            "MISS"
        },
        status.as_u16(),
        path
    );

    Page {
        path: only_path,
        body,
        status: status.as_u16(),
        is_cloudfront_cache_hit,
        ..Default::default()
    }
}

pub fn extract_links_from_html(body: &str) -> Vec<String> {
    let mut urls: Vec<String> = Vec::new();

    let html = scraper::Html::parse_document(body);

    let a_selector = scraper::Selector::parse("a").unwrap();
    for a_element in html.select(&a_selector) {
        if let Some(href) = a_element.value().attr("href") {
            urls.push(href.to_owned());
        }
    }

    let img_selector = scraper::Selector::parse("img").unwrap();
    for img_element in html.select(&img_selector) {
        if let Some(src) = img_element.value().attr("src") {
            urls.push(src.to_owned());
        }
    }

    let script_selector = scraper::Selector::parse("script").unwrap();
    for script_element in html.select(&script_selector) {
        if let Some(src) = script_element.value().attr("src") {
            urls.push(src.to_owned());
        }
    }

    let link_selector = scraper::Selector::parse("link").unwrap();
    for link_element in html.select(&link_selector) {
        if let Some(href) = link_element.value().attr("href") {
            urls.push(href.to_owned());
        }
    }

    urls
}

pub fn crawl(body: &str, stage_name: &str) -> Vec<String> {
    let domain = get_base_domain(stage_name);

    let urls = extract_links_from_html(body);

    // Normalize same-origin absolute URLs to path-only and dedupe
    use std::collections::HashSet;
    let mut seen: HashSet<String> = HashSet::new();
    let mut normalized: Vec<String> = Vec::new();

    let https_prefix = format!("https://{}", domain);
    let http_prefix = format!("http://{}", domain);
    let proto_rel_prefix = format!("//{}", domain);

    for url in urls.into_iter() {
        let p = if url.starts_with('/') {
            // already a path
            if url.is_empty() {
                "/".to_string()
            } else {
                url
            }
        } else if url.starts_with(&https_prefix) {
            let mut s = url[https_prefix.len()..].to_owned();
            if s.is_empty() {
                s = "/".to_string();
            }
            if !s.starts_with('/') {
                s.insert(0, '/');
            }
            s
        } else if url.starts_with(&http_prefix) {
            let mut s = url[http_prefix.len()..].to_owned();
            if s.is_empty() {
                s = "/".to_string();
            }
            if !s.starts_with('/') {
                s.insert(0, '/');
            }
            s
        } else if url.starts_with(&proto_rel_prefix) {
            let mut s = url[proto_rel_prefix.len()..].to_owned();
            if s.is_empty() {
                s = "/".to_string();
            }
            if !s.starts_with('/') {
                s.insert(0, '/');
            }
            s
        } else {
            // Not same-origin and not a path — skip
            continue;
        };

        if seen.insert(p.clone()) {
            normalized.push(p);
        }
    }

    normalized
}

pub async fn crawl_and_visit(
    stage_name: &str,
    authorization: Option<&str>,
) -> Result<Vec<Page>, lambda_runtime::Error> {
    let mut pages = HashMap::new();
    pages.insert(
        "/".to_owned(),
        Page {
            path: "/".to_owned(),
            ..Default::default()
        },
    );

    loop {
        let unvisited_paths: Vec<String> = pages
            .values()
            .filter(|p| !p.visited)
            .map(|p| p.path.clone())
            .collect();

        if unvisited_paths.is_empty() {
            break;
        }

        for path in unvisited_paths {
            // Visit the page
            let mut visited_page = visit(&path, stage_name, authorization).await;
            visited_page.visited = true;
            pages.insert(visited_page.path.clone(), visited_page.clone());

            // Crawl the page

            if let Some(body) = &visited_page.body {
                let extracted_paths = crawl(&body, stage_name);
                for new_path in extracted_paths {
                    pages.entry(new_path.clone()).or_insert(Page {
                        path: new_path,
                        ..Default::default()
                    });
                }
            } else {
            }
        }
    }

    Ok(pages.into_values().collect())
}
