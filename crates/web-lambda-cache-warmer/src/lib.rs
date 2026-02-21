pub mod ssm;
pub mod util;

use std::collections::HashSet;

#[derive(Debug, Default, Clone, serde::Serialize)]
pub struct FetchResult {
    pub path: String,
    pub status: u16,
    pub is_cloudfront_cache_hit: bool,
}

struct State {
    queued_paths: HashSet<String>,
    in_flight_paths: HashSet<String>,
    completed_paths: HashSet<String>,

    fetch_results: Vec<FetchResult>,
}

pub async fn visit(
    path: &str,
    stage_name: &str,
    authorization: Option<&str>,
) -> (FetchResult, Option<String>) {
    let base_domain = util::get_base_domain(stage_name);

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
            return (
                FetchResult {
                    path: only_path,
                    status: 0,
                    is_cloudfront_cache_hit: false,
                    ..Default::default()
                },
                None,
            );
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

    (
        FetchResult {
            path: only_path,
            status: status.as_u16(),
            is_cloudfront_cache_hit,
            ..Default::default()
        },
        body,
    )
}

pub fn extract_all_links_from_html(body: &str) -> Vec<String> {
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

pub fn extract_all_links_from_html_and_normalize_same_origin_paths(
    body: &str,
    stage_name: &str,
) -> Vec<String> {
    let domain = util::get_base_domain(stage_name);

    let urls = extract_all_links_from_html(body);

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
) -> Result<Vec<FetchResult>, lambda_runtime::Error> {
    let mut queued = HashSet::new();
    queued.insert(String::from("/"));

    let state = tokio::sync::Mutex::new(State {
        queued_paths: queued,
        in_flight_paths: HashSet::new(),
        completed_paths: HashSet::new(),
        fetch_results: Vec::new(),
    });

    loop {
        let queued_paths = {
            let mut state_guard = state.lock().await;

            if state_guard.queued_paths.is_empty() {
                break;
            }

            let drained_queued_paths = state_guard.queued_paths.drain().collect::<Vec<_>>();

            state_guard
                .in_flight_paths
                .extend(drained_queued_paths.iter().cloned());

            drained_queued_paths.into_iter().collect::<HashSet<_>>()
        };

        let futures = queued_paths
            .iter()
            .map(|path| visit(path, stage_name, authorization))
            .collect::<Vec<_>>();

        let results = futures::future::join_all(futures).await;

        {
            let mut state_guard = state.lock().await;
            let drained_in_flight_paths = state_guard.in_flight_paths.drain().collect::<Vec<_>>();
            state_guard.completed_paths.extend(drained_in_flight_paths);
        }

        for (fetch_result, body) in results {
            if let Some(body) = body {
                let links =
                    extract_all_links_from_html_and_normalize_same_origin_paths(&body, stage_name);

                let mut state_guard = state.lock().await;

                for link in links {
                    if !(state_guard.queued_paths.contains(&link)
                        || state_guard.in_flight_paths.contains(&link)
                        || state_guard.completed_paths.contains(&link))
                    {
                        state_guard.queued_paths.insert(link);
                    }
                }

                state_guard.fetch_results.push(fetch_result);
            };
        }
    }

    let fetch_results = state.lock().await.fetch_results.clone();

    Ok(fetch_results)
}
