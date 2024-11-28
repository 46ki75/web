pub struct Blog {
    pub slug: String,
    pub title: String,
    pub description: String,
}

impl Blog {
    pub async fn get_by_slug(
        ctx: &async_graphql::Context<'_>,
        slug: u64,
    ) -> Result<Self, async_graphql::Error> {
        dotenvy::dotenv().ok();

        let notion_token = std::env::var("NOTION_API_KEY")?;
        let database_id = std::env::var("NOTION_BLOG_DATABASE_ID")?;

        let client = notionrs::Client::new().secret(notion_token);

        let filter = notionrs::filter::Filter::unique_id_equals("slug", slug);

        let request = client
            .query_database()
            .database_id(database_id)
            .filter(filter);

        let response = request.send().await?;

        let blog = response
            .results
            .first()
            .ok_or(async_graphql::Error::new("Blog not found"))?;

        let title = blog
            .properties
            .get("title")
            .ok_or(async_graphql::Error::new("title not found"))?
            .to_string();

        let description = blog
            .properties
            .get("description")
            .ok_or(async_graphql::Error::new("description not found"))?
            .to_string();

        Ok(Blog {
            slug: slug.to_string(),
            title,
            description,
        })
    }

    pub async fn list(ctx: &async_graphql::Context<'_>) -> Result<Vec<Self>, async_graphql::Error> {
        let notion_token = std::env::var("NOTION_API_KEY")?;
        let database_id = std::env::var("NOTION_BLOG_DATABASE_ID")?;

        let client = notionrs::Client::new().secret(notion_token);

        let request = client.query_database().database_id(database_id);

        let response = request.send().await?;

        let blogs = response
            .results
            .iter()
            .map(|blog| {
                let slug = blog
                    .properties
                    .get("slug")
                    .ok_or(async_graphql::Error::new("slug not found"))?
                    .to_string();

                let title = blog
                    .properties
                    .get("title")
                    .ok_or(async_graphql::Error::new("title not found"))?
                    .to_string();

                let description = blog
                    .properties
                    .get("description")
                    .ok_or(async_graphql::Error::new("description not found"))?
                    .to_string();

                Ok(Blog {
                    slug,
                    title,
                    description,
                })
            })
            .collect::<Result<Vec<Blog>, async_graphql::Error>>()?;

        Ok(blogs)
    }
}

#[async_graphql::Object]
impl Blog {
    pub async fn slug(&self) -> String {
        self.slug.to_string()
    }

    pub async fn title(&self) -> String {
        self.title.to_string()
    }

    pub async fn description(&self) -> String {
        self.description.to_string()
    }
}
