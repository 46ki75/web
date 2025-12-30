use std::collections::HashMap;

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

fn crawl(page: &str) -> Vec<String> {
    // Dummy implementation: In a real crawler, you'd parse the page body
    // and extract links. Here we just return an empty vector.
    vec!["/".to_owned(), "/about".to_owned(), "/contact".to_owned()]
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
            let extracted_paths = crawl(&visited_page.path);
            for new_path in extracted_paths {
                pages.entry(new_path.clone()).or_insert(Page {
                    path: new_path,
                    ..Default::default()
                });
            }
        }
    }

    report(&pages);
}
