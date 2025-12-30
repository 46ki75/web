use std::{collections::HashMap, path};

fn get_base_domain() -> String {
    "www.ikuma.cloud".to_owned()
}

#[derive(Debug, Default, Clone)]
struct Page {
    path: String,
    body: Option<String>,
    visited: bool,
}

fn report(pages: &HashMap<String, Page>) {
    println!("Visited {} pages", pages.len());
}

async fn visit(path: &str) -> Page {
    let client = reqwest::Client::new();
    let url = format!("https://{}{}", get_base_domain(), path);

    let response = client.get(&url).send().await.unwrap();
    let body = response.text().await.unwrap();

    Page {
        path: path.to_owned(),
        body: Some(body),
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
