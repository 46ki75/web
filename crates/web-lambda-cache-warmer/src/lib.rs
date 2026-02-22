pub mod sitemap;
pub mod ssm;
pub mod util;

use std::collections::HashSet;
use std::sync::LazyLock;

use crate::sitemap::fetch_sitemap_urls;

#[derive(Debug, Default, Clone, serde::Serialize)]
pub struct FetchResult {
    pub path: String,
    pub status: u16,
    pub is_cloudfront_cache_hit: bool,
}

// Compile CSS selectors once at startup rather than on every parse call.
static A_SELECTOR: LazyLock<scraper::Selector> =
    LazyLock::new(|| scraper::Selector::parse("a").unwrap());
static IMG_SELECTOR: LazyLock<scraper::Selector> =
    LazyLock::new(|| scraper::Selector::parse("img").unwrap());
static SCRIPT_SELECTOR: LazyLock<scraper::Selector> =
    LazyLock::new(|| scraper::Selector::parse("script").unwrap());
static LINK_SELECTOR: LazyLock<scraper::Selector> =
    LazyLock::new(|| scraper::Selector::parse("link").unwrap());

pub async fn visit(
    path: &str,
    stage_name: &str,
    authorization: Option<&str>,
    client: &reqwest::Client,
) -> (FetchResult, Option<String>) {
    let base_domain = util::get_base_domain(stage_name);

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

    tracing::debug!(
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
    let html = scraper::Html::parse_document(body);

    // (selector, attribute) pairs — selectors are compiled once via LazyLock.
    let pairs: [(&scraper::Selector, &str); 4] = [
        (&A_SELECTOR, "href"),
        (&IMG_SELECTOR, "src"),
        (&SCRIPT_SELECTOR, "src"),
        (&LINK_SELECTOR, "href"),
    ];

    pairs
        .iter()
        .flat_map(|(sel, attr)| {
            html.select(sel)
                .filter_map(|el| el.value().attr(attr).map(str::to_owned))
                .collect::<Vec<_>>()
        })
        .collect()
}

/// Strip a known prefix from `url` and ensure the remainder starts with `/`.
fn strip_origin_prefix(url: &str, prefix: &str) -> String {
    let rest = &url[prefix.len()..];
    if rest.is_empty() {
        "/".to_owned()
    } else if rest.starts_with('/') {
        rest.to_owned()
    } else {
        format!("/{}", rest)
    }
}

pub fn extract_all_links_from_html_and_normalize_same_origin_paths(
    body: &str,
    stage_name: &str,
) -> Vec<String> {
    let domain = util::get_base_domain(stage_name);
    let https_prefix = format!("https://{}", domain);
    let http_prefix = format!("http://{}", domain);
    let proto_rel_prefix = format!("//{}", domain);

    let mut seen: HashSet<String> = HashSet::new();
    let mut normalized: Vec<String> = Vec::new();

    for url in extract_all_links_from_html(body) {
        let p = if url.starts_with('/') {
            // Already a path (a non-empty string starting with '/' can't be empty).
            url
        } else if url.starts_with(&https_prefix) {
            strip_origin_prefix(&url, &https_prefix)
        } else if url.starts_with(&http_prefix) {
            strip_origin_prefix(&url, &http_prefix)
        } else if url.starts_with(&proto_rel_prefix) {
            strip_origin_prefix(&url, &proto_rel_prefix)
        } else {
            // Cross-origin or non-URL — skip.
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
    // A single client is reused across all requests for connection pooling.
    let client = reqwest::Client::new();

    let base_domain = util::get_base_domain(stage_name);
    let urls = fetch_sitemap_urls(&base_domain).await.unwrap();

    // Plain mutable state — no Mutex needed because all concurrent work is
    // awaited before state is touched (this is a single async task).
    let mut queued: HashSet<String> = HashSet::from_iter(urls);
    let mut completed: HashSet<String> = HashSet::new();
    let mut fetch_results: Vec<FetchResult> = Vec::new();

    while !queued.is_empty() {
        // Drain the current batch and mark everything as in-flight by moving
        // it into `completed` immediately after the await.
        let batch: HashSet<String> = queued.drain().collect();

        let results = futures::future::join_all(
            batch
                .iter()
                .map(|path| visit(path, stage_name, authorization, &client)),
        )
        .await;

        // All requests in this batch are now done; mark them completed.
        completed.extend(batch);

        // Extract links from all results (CPU work) then update state in one pass.
        for (fetch_result, body) in results {
            if let Some(body) = body {
                for link in
                    extract_all_links_from_html_and_normalize_same_origin_paths(&body, stage_name)
                {
                    if !completed.contains(&link) && !queued.contains(&link) {
                        queued.insert(link);
                    }
                }
                fetch_results.push(fetch_result);
            }
        }

        tracing::info!(
            "| queued: {} | completed: {} |",
            queued.len(),
            completed.len(),
        );
    }

    Ok(fetch_results)
}
