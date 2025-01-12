pub struct QueryRoot;

#[async_graphql::Object]
impl QueryRoot {
    async fn greet(&self) -> String {
        "Hello, world!".to_string()
    }
}
