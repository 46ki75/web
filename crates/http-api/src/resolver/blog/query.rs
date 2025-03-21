pub struct BlogQueryResolver {}

pub struct Blog {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub ogp_image_s3_url: Option<String>,
    pub tags: Vec<BlogTag>,
    pub status: Status,
    pub created_at: String,
    pub updated_at: String,
}

impl From<crate::entity::blog::BlogEntity> for Blog {
    fn from(value: crate::entity::blog::BlogEntity) -> Self {
        Blog {
            id: value.id,
            slug: value.slug,
            title: value.title,
            description: value.description,
            ogp_image_s3_url: value.ogp_image_s3_url,
            tags: value
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
            status: match value.status {
                crate::entity::blog::BlogStatusEntity::Draft => Status::Draft,
                crate::entity::blog::BlogStatusEntity::Published => Status::Published,
                crate::entity::blog::BlogStatusEntity::Archived => Status::Archived,
            },
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BlogTag {
    pub id: String,
    pub name: String,
    pub color: String,
}

#[async_graphql::Object]
impl BlogTag {
    pub async fn id(&self) -> Result<String, async_graphql::Error> {
        Ok(self.id.clone())
    }

    pub async fn name(&self) -> Result<String, async_graphql::Error> {
        Ok(self.name.clone())
    }

    pub async fn color(&self) -> Result<String, async_graphql::Error> {
        Ok(self.color.clone())
    }

    pub async fn blog_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<Blog>, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let blog_entities = blog_service
            .list_blogs_by_tags(vec![self.name.clone()])
            .await?;

        let blogs = blog_entities
            .into_iter()
            .map(Blog::from)
            .collect::<Vec<Blog>>();

        Ok(blogs)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, async_graphql::Enum)]
pub enum Status {
    Draft,
    Published,
    Archived,
}

#[derive(Debug, async_graphql::InputObject)]
pub struct BlogInput {
    pub page_id: String,
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

    pub async fn ogp_image_s3_url(&self) -> Result<Option<String>, async_graphql::Error> {
        Ok(self.ogp_image_s3_url.clone())
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
    pub async fn blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        input: BlogInput,
    ) -> Result<Blog, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let blog_entity = blog_service.get_blog_by_id(&input.page_id).await?;

        let blog = Blog::from(blog_entity);

        Ok(blog)
    }

    pub async fn blog_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<Blog>, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let blog_entities = blog_service.list_blogs().await?;

        let blogs = blog_entities
            .into_iter()
            .map(Blog::from)
            .collect::<Vec<Blog>>();

        Ok(blogs)
    }

    pub async fn tag_list(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<BlogTag>, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let tags = blog_service.list_tags().await?;

        let blog_tags = tags
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
            .collect::<Vec<BlogTag>>();

        Ok(blog_tags)
    }
}
