pub struct BlogQueryResolver {}

pub struct Blog {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub tags: Vec<BlogTag>,
    pub status: Status,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, async_graphql::SimpleObject)]
pub struct BlogTag {
    pub id: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, async_graphql::Enum)]
pub enum Status {
    Draft,
    Published,
    Archived,
}

#[async_graphql::Object]
impl Blog {
    pub async fn id(&self) -> Result<String, async_graphql::Error> {
        Ok(self.id.clone())
    }

    pub async fn slug(&self) -> Result<String, async_graphql::Error> {
        Ok(self.slug.clone())
    }

    pub async fn title(&self) -> Result<String, async_graphql::Error> {
        Ok(self.title.clone())
    }

    pub async fn description(&self) -> Result<String, async_graphql::Error> {
        Ok(self.description.clone())
    }

    pub async fn tags(&self) -> Result<Vec<BlogTag>, async_graphql::Error> {
        Ok(self.tags.clone())
    }

    pub async fn status(&self) -> Result<Status, async_graphql::Error> {
        Ok(self.status)
    }

    pub async fn created_at(&self) -> Result<String, async_graphql::Error> {
        Ok(self.created_at.clone())
    }

    pub async fn updated_at(&self) -> Result<String, async_graphql::Error> {
        Ok(self.updated_at.clone())
    }

    pub async fn block_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<serde_json::Value>, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let block_children = blog_service.get_block_children(&self.id).await?;

        let serialised = serde_json::from_str(&block_children).map_err(|e| {
            tracing::error!("Failed to serialize response: {}", e);
            async_graphql::Error::new("Failed to serialize response")
        })?;

        Ok(serialised)
    }
}

impl BlogQueryResolver {
    pub async fn blog_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<Blog>, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let blogs = blog_service.list_blogs().await?;

        let blogs = blogs
            .into_iter()
            .map(|blog| Blog {
                id: blog.id,
                slug: blog.slug,
                title: blog.title,
                description: blog.description,
                tags: blog
                    .tags
                    .into_iter()
                    .map(|tag| BlogTag {
                        id: tag.id,
                        name: tag.name,
                        color: match tag.color {
                            crate::entity::blog::BlogTagColorEntity::Default => "#868e9c",
                            crate::entity::blog::BlogTagColorEntity::Blue => "#6987b8",
                            crate::entity::blog::BlogTagColorEntity::Brown => "#a17c5b",
                            crate::entity::blog::BlogTagColorEntity::Gray => "#868e9c",
                            crate::entity::blog::BlogTagColorEntity::Green => "#59b57c",
                            crate::entity::blog::BlogTagColorEntity::Orange => "#d48b70",
                            crate::entity::blog::BlogTagColorEntity::Pink => "#c9699e",
                            crate::entity::blog::BlogTagColorEntity::Purple => "#9771bd",
                            crate::entity::blog::BlogTagColorEntity::Red => "#c56565",
                            crate::entity::blog::BlogTagColorEntity::Yellow => "#cdb57b",
                        }
                        .to_string(),
                    })
                    .collect::<Vec<BlogTag>>(),
                status: match blog.status {
                    crate::entity::blog::BlogStatusEntity::Draft => Status::Draft,
                    crate::entity::blog::BlogStatusEntity::Published => Status::Published,
                    crate::entity::blog::BlogStatusEntity::Archived => Status::Archived,
                },
                created_at: blog.created_at,
                updated_at: blog.updated_at,
            })
            .collect::<Vec<Blog>>();

        Ok(blogs)
    }
}
