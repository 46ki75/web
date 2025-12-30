use std::{
    collections::{HashMap, HashSet},
    path,
};

struct Page {
    path: String,
}

fn report(pages: &HashMap<String, Page>) {
    println!("Visited {} pages", pages.len());
}

async fn visit(path: &str) -> Page {
    Page {
        path: path.to_owned(),
    }
}

#[tokio::main]
async fn main() {
    let mut queue: HashSet<String> = HashSet::new();

    queue.insert("/".to_owned());

    let mut pages: HashMap<String, Page> = HashMap::new();

    for path in queue.iter() {
        let page = visit(path).await;

        pages.insert(path.clone(), page);
    }

    report(&pages);
}
