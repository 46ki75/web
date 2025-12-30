use std::collections::{HashMap, HashSet};

struct Page {
    path: String,
}

fn report(pages: &HashMap<String, Page>) {
    println!("Visited {} pages", pages.len());
}

#[tokio::main]
async fn main() {
    let mut queue: HashSet<String> = HashSet::new();

    queue.insert("/".to_owned());

    let mut pages: HashMap<String, Page> = HashMap::new();

    for path in queue.iter() {
        println!("Visiting: {}", path);

        pages.insert(path.clone(), Page { path: path.clone() });
    }

    report(&pages);
}
