use std::collections::HashMap;

fn get_base_domain() -> String {
    "dev-www.ikuma.cloud".to_owned()
}

#[derive(Debug, Default, Clone)]
struct Page {
    path: String,
    body: Option<String>,
    status: u16,
    visited: bool,
    is_cloudfront_cache_hit: bool,
}

fn report(pages: &HashMap<String, Page>) {
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

async fn visit(path: &str) -> Page {
    let client = reqwest::Client::new();
    let url = if path.starts_with("http://") || path.starts_with("https://") {
        path.to_owned()
    } else if path.starts_with("//") {
        format!("https:{}", path)
    } else if path.starts_with('/') {
        format!("https://{}{}", get_base_domain(), path)
    } else {
        format!("https://{}/{}", get_base_domain(), path)
    };

    tracing::info!("Visiting {}", url);

    let mut req = client.get(&url);
    if let Ok(auth) = std::env::var("AUTHORIZATION") {
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
        path: path.to_owned(),
        body,
        status: status.as_u16(),
        is_cloudfront_cache_hit,
        ..Default::default()
    }
}

fn crawl(body: &str) -> Vec<String> {
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

    let same_origin_path = urls
        .into_iter()
        .filter(|url| {
            let is_starting_slash = url.starts_with('/');

            let is_same_origin = url.starts_with(&format!("https://{}", get_base_domain()));

            is_starting_slash || is_same_origin
        })
        .collect::<Vec<String>>();

    same_origin_path
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt::fmt().init();

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
            let mut visited_page = visit(&path).await;
            visited_page.visited = true;
            pages.insert(visited_page.path.clone(), visited_page.clone());

            // Crawl the page

            if let Some(body) = &visited_page.body {
                let extracted_paths = crawl(&body);
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

    report(&pages);
}
