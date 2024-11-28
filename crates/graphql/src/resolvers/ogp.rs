pub struct Ogp {
    pub title: String,
}

impl Ogp {
    pub fn new(_ctx: &async_graphql::Context) -> Result<Self, async_graphql::Error> {
        Ok(Ogp {
            title: "Open Graph Protocol".to_string(),
        })
    }
}

#[async_graphql::Object]
impl Ogp {
    pub async fn title(&self) -> String {
        self.title.to_string()
    }
}
