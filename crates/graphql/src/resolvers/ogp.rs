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
        let selector = scraper::Selector::parse("title").unwrap();
        let title_element = document.select(&selector).next();
        let title = match title_element {
            Some(element) => element.text().collect::<String>(),
            None => return None,
        };

        Some(title)
    }

    pub async fn og_title(&self) -> Option<String> {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("meta[property='og:title']").unwrap();
        let og_title_element = document.select(&selector).next();
        let og_title = match og_title_element {
            Some(element) => {
                let og_title = element.value().attr("content").unwrap_or_default();
                Some(og_title.to_string())
            }
            None => None,
        };

        og_title
    }

    pub async fn og_description(&self) -> Option<String> {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("meta[property='og:description']").unwrap();
        let og_description_element = document.select(&selector).next();
        let og_description = match og_description_element {
            Some(element) => {
                let og_description = element.value().attr("content").unwrap_or_default();
                Some(og_description.to_string())
            }
            None => None,
        };

        og_description
    }

    pub async fn og_image(&self) -> Option<String> {
        let document = scraper::Html::parse_document(&self.body);
        let selector = scraper::Selector::parse("meta[property='og:image']").unwrap();
        let og_image_element = document.select(&selector).next();
        let og_image = match og_image_element {
            Some(element) => {
                let og_image = element.value().attr("content").unwrap_or_default();
                Some(og_image.to_string())
            }
            None => None,
        };

        og_image
    }
}
