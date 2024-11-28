pub struct Blog {
    pub slug: String,
    pub title: String,
}

impl Blog {
    pub async fn get(
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

        let title_rich_text = blog
            .properties
            .get("title")
            .ok_or(async_graphql::Error::new("title not found"))?;

        let title = title_rich_text.to_string();

        // let results = response.results.iter().map(|blog| {
        //     let slug = blog
        //         .properties
        //         .get("slug")
        //         .ok_or(|_| Err(async_graphql::Error::new("slug not found")));
        //     Blog { slug }
        // });

        Ok(Blog {
            slug: slug.to_string(),
            title,
        })
    }

    pub fn list(ctx: &async_graphql::Context) -> Result<Vec<Self>, async_graphql::Error> {
        Ok(vec![
            Blog {
                slug: "001".to_string(),
                title: "First blog".to_string(),
            },
            Blog {
                slug: "002".to_string(),
                title: "Second blog".to_string(),
            },
            Blog {
                slug: "003".to_string(),
                title: "Third blog".to_string(),
            },
        ])
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
}
