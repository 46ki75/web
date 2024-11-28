pub struct Ogp {
    pub url: String,
    pub body: String,
}

impl Ogp {
    pub async fn new(
        _ctx: &async_graphql::Context<'_>,
        url: String,
    ) -> Result<Self, async_graphql::Error> {
        let client = reqwest::Client::new();
        let response = client.get(url.clone()).send().await?;
        let body = response.text().await?;

        Ok(Ogp { url, body })
    }
}

#[async_graphql::Object]
impl Ogp {
    pub async fn url(&self) -> String {
        self.url.to_string()
    }

    pub async fn body(&self) -> String {
        self.body.to_string()
    }

    pub async fn title(&self) -> Option<String> {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("title").ok()?;
        document
            .select(&selector)
            .next()?
            .text()
            .next()
            .map(|s| s.to_string())
    }

    pub async fn og_title(&self) -> Option<String> {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("meta[property='og:title']").ok()?;
        document
            .select(&selector)
            .next()?
            .value()
            .attr("content")
            .map(|s| s.to_string())
    }

    pub async fn og_description(&self) -> Option<String> {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("meta[property='og:description']").ok()?;
        document
            .select(&selector)
            .next()?
            .value()
            .attr("content")
            .map(|s| s.to_string())
    }

    pub async fn og_image(&self) -> Option<String> {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("meta[property='og:image']").ok()?;
        document
            .select(&selector)
            .next()?
            .value()
            .attr("content")
            .map(|s| s.to_string())
    }
}
