pub struct Blog {
    pub slug: String,
    pub title: String,
    pub description: String,
    pub ogp_image: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl Blog {
    pub async fn get_by_slug(
        _ctx: &async_graphql::Context<'_>,
        slug: u64,
    ) -> Result<Self, async_graphql::Error> {
        let notion_token = std::env::var("NOTION_API_KEY")?;
        let database_id = std::env::var("NOTION_BLOG_DATABASE_ID")?;

        let client = notionrs::Client::new().secret(notion_token);

        let slug_filter = notionrs::filter::Filter::unique_id_equals("slug", slug);
        let status_filter = notionrs::filter::Filter::status_equals("status", "published");
        let filter = notionrs::filter::Filter::and(vec![slug_filter, status_filter]);

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

        let ogp_image = blog
            .properties
            .get("ogp_image")
            .map(|value| value.to_string());

        let created_at = blog
            .properties
            .get("createdAt")
            .ok_or(async_graphql::Error::new("created_at not found"))?
            .to_string();

        let updated_at = blog
            .properties
            .get("updatedAt")
            .ok_or(async_graphql::Error::new("updated_at not found"))?
            .to_string();

        Ok(Blog {
            slug: slug.to_string(),
            title,
            description,
            ogp_image,
            created_at,
            updated_at,
        })
    }

    pub async fn list(
        _ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<Self>, async_graphql::Error> {
        let notion_token = std::env::var("NOTION_API_KEY")?;
        let database_id = std::env::var("NOTION_BLOG_DATABASE_ID")?;

        let client = notionrs::Client::new().secret(notion_token);

        let status_filter = notionrs::filter::Filter::status_equals("status", "published");

        let request = client
            .query_database()
            .database_id(database_id)
            .filter(status_filter);

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

                let ogp_image = blog
                    .properties
                    .get("ogpImage")
                    .map(|value| value.to_string());

                let created_at = blog
                    .properties
                    .get("createdAt")
                    .ok_or(async_graphql::Error::new("created_at not found"))?
                    .to_string();

                let updated_at = blog
                    .properties
                    .get("updatedAt")
                    .ok_or(async_graphql::Error::new("updated_at not found"))?
                    .to_string();

                Ok(Blog {
                    slug,
                    title,
                    description,
                    ogp_image,
                    created_at,
                    updated_at,
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

    pub async fn ogp_image(&self) -> Option<String> {
        match &self.ogp_image {
            Some(image) => {
                if image.is_empty() {
                    None
                } else {
                    Some(image.to_string())
                }
            }
            None => None,
        }
    }

    pub async fn created_at(&self) -> String {
        self.created_at.to_string()
    }

    pub async fn updated_at(&self) -> String {
        self.updated_at.to_string()
    }
}
