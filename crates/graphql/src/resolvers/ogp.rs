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

    pub async fn title(&self) -> String {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("title").unwrap();
        let title = document
            .select(&selector)
            .next()
            .unwrap()
            .text()
            .collect::<String>();

        title
    }

    pub async fn og_title(&self) -> String {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("meta[property='og:title']").unwrap();
        let og_title = document
            .select(&selector)
            .next()
            .unwrap()
            .value()
            .attr("content")
            .unwrap()
            .to_string();

        og_title
    }

    pub async fn og_description(&self) -> String {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("meta[property='og:description']").unwrap();
        let og_description = document
            .select(&selector)
            .next()
            .unwrap()
            .value()
            .attr("content")
            .unwrap()
            .to_string();

        og_description
    }

    pub async fn og_image(&self) -> String {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("meta[property='og:image']").unwrap();
        let og_image = document
            .select(&selector)
            .next()
            .unwrap()
            .value()
            .attr("content")
            .unwrap()
            .to_string();

        og_image
    }
}
