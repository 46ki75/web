pub struct Blog {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub ogp_image: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub tags: Vec<Tag>,
}

#[derive(Clone, async_graphql::SimpleObject)]
pub struct Tag {
    id: String,
    name: String,
    color: String,
}

#[derive(async_graphql::Enum, Copy, Clone, Eq, PartialEq, Default)]
pub enum SortDirection {
    Asc,
    #[default]
    Desc,
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

        let tags = blog
            .properties
            .get("tags")
            .map(|value| match &value {
                notionrs::page::PageProperty::MultiSelect(tags) => tags
                    .multi_select
                    .iter()
                    .map(|tag| {
                        let id = tag
                            .id
                            .clone()
                            .ok_or_else(|| async_graphql::Error::new("tag id not found"))?;

                        let color = tag
                            .color
                            .ok_or_else(|| async_graphql::Error::new("tag color not found"))?;

                        let color_string = serde_json::to_string(&color)
                            .map_err(|e| async_graphql::Error::new(e.to_string()))?
                            .replace("\"", "");

                        Ok(Tag {
                            id,
                            name: tag.name.to_string(),
                            color: color_string,
                        })
                    })
                    .collect::<Result<Vec<Tag>, async_graphql::Error>>(),
                _ => Err(async_graphql::Error::new("tags not found")),
            })
            .unwrap_or_else(|| Ok(vec![]))?;

        Ok(Blog {
            id: blog.id.clone(),
            slug: slug.to_string(),
            title,
            description,
            ogp_image,
            created_at,
            updated_at,
            tags,
        })
    }

    pub async fn list(
        _: &async_graphql::Context<'_>,
        sort: SortDirection,
    ) -> Result<Vec<Self>, async_graphql::Error> {
        let notion_token = std::env::var("NOTION_API_KEY")?;
        let database_id = std::env::var("NOTION_BLOG_DATABASE_ID")?;

        let client = notionrs::Client::new().secret(notion_token);

        let status_filter = notionrs::filter::Filter::status_equals("status", "published");

        let sort = match sort {
            SortDirection::Asc => notionrs::database::sort::Sort::asc("createdAt"),
            SortDirection::Desc => notionrs::database::sort::Sort::desc("createdAt"),
        };

        let request = client
            .query_database()
            .database_id(database_id)
            .filter(status_filter)
            .sorts(vec![sort]);

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

                let tags =
                    blog.properties
                        .get("tags")
                        .map(|value| match &value {
                            notionrs::page::PageProperty::MultiSelect(tags) => tags
                                .multi_select
                                .iter()
                                .map(|tag| {
                                    let id = tag.id.clone().ok_or_else(|| {
                                        async_graphql::Error::new("tag id not found")
                                    })?;

                                    let color = tag.color.ok_or_else(|| {
                                        async_graphql::Error::new("tag color not found")
                                    })?;

                                    let color_string = serde_json::to_string(&color)
                                        .map_err(|e| async_graphql::Error::new(e.to_string()))?
                                        .replace("\"", "");

                                    Ok(Tag {
                                        id,
                                        name: tag.name.to_string(),
                                        color: color_string,
                                    })
                                })
                                .collect::<Result<Vec<Tag>, async_graphql::Error>>(),
                            _ => Err(async_graphql::Error::new("tags not found")),
                        })
                        .unwrap_or_else(|| Ok(vec![]))?;

                Ok(Blog {
                    id: blog.id.clone(),
                    slug,
                    title,
                    description,
                    ogp_image,
                    created_at,
                    updated_at,
                    tags,
                })
            })
            .collect::<Result<Vec<Blog>, async_graphql::Error>>()?;

        Ok(blogs)
    }

    pub async fn search(
        _: &async_graphql::Context<'_>,
        keyword: String,
    ) -> Result<Vec<Self>, async_graphql::Error> {
        let notion_token = std::env::var("NOTION_API_KEY")?;

        let client = notionrs::Client::new().secret(notion_token);

        let request = client.search().filter_page().query(keyword);

        let response = request.send().await?;

        let blogs = response
            .results
            .iter()
            .filter_map(|result| match result {
                notionrs::list_response::SearchResultItem::Database(_) => None,
                notionrs::list_response::SearchResultItem::Page(page) => {
                    let properties = &page.properties;

                    let status = properties.get("status")?.to_string();

                    if status != "published" {
                        return None;
                    };

                    let id = page.id.clone();

                    let slug = properties.get("slug").map(|value| value.to_string())?;

                    let title = properties.get("title").map(|value| value.to_string())?;

                    let description = properties
                        .get("description")
                        .map(|value| value.to_string())?;

                    let ogp_image = properties.get("ogpImage").map(|value| value.to_string());

                    let created_at = properties.get("createdAt").map(|value| value.to_string())?;

                    let updated_at = properties.get("updatedAt").map(|value| value.to_string())?;

                    let tags = properties
                        .get("tags")
                        .map(|value| match value {
                            notionrs::page::PageProperty::MultiSelect(tags) => tags
                                .multi_select
                                .iter()
                                .map(|tag| {
                                    let id = tag.id.clone().ok_or_else(|| {
                                        async_graphql::Error::new("tag id not found")
                                    })?;

                                    let color = tag.color.ok_or_else(|| {
                                        async_graphql::Error::new("tag color not found")
                                    })?;

                                    let color_string = serde_json::to_string(&color)
                                        .map_err(|e| async_graphql::Error::new(e.to_string()))?
                                        .replace("\"", "");

                                    Ok(Tag {
                                        id,
                                        name: tag.name.to_string(),
                                        color: color_string,
                                    })
                                })
                                .collect::<Result<Vec<Tag>, async_graphql::Error>>(),
                            _ => Err(async_graphql::Error::new("tags not found")),
                        })?
                        .ok()?;

                    Some(Blog {
                        id,
                        slug,
                        title,
                        description,
                        ogp_image,
                        created_at,
                        updated_at,
                        tags,
                    })
                }
            })
            .collect::<Vec<Blog>>();

        Ok(blogs)
    }
}

#[async_graphql::Object]
impl Blog {
    pub async fn id(&self) -> String {
        self.id.to_string()
    }

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

    pub async fn tags(&self) -> Vec<Tag> {
        self.tags.clone()
    }
}
