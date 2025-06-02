#![deny(missing_docs)]

//! Contains methods that resolve blogs and blog tags.

/// Contains methods that resolve blogs and blog tags.
pub struct BlogQueryResolver {}

#[allow(missing_docs)]

pub struct Blog {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub ogp_image_s3_url: Option<String>,
    pub tags: Vec<BlogTag>,
    pub status: Status,
    pub keywords: Vec<String>,
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
            keywords: value.keywords,
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

/// Tag associated with blog.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BlogTag {
    /// Unique identifier of the blog tag.
    pub id: String,

    /// Name of the blog.
    pub name: String,

    /// Color code (HEX) of the blog.
    pub color: String,
}

impl From<crate::entity::blog::BlogTagEntity> for BlogTag {
    fn from(tag: crate::entity::blog::BlogTagEntity) -> Self {
        BlogTag {
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
        }
    }
}

/// Language of Blog Articles.
#[derive(Debug, Clone, Copy, Eq, PartialEq, async_graphql::Enum)]
pub enum BlogLanguage {
    /// English
    En,
    /// Japanese
    Ja,
}

impl From<BlogLanguage> for crate::service::blog::BlogLanguageServiceInput {
    fn from(value: BlogLanguage) -> Self {
        match value {
            BlogLanguage::En => Self::En,
            BlogLanguage::Ja => Self::Ja,
        }
    }
}

#[async_graphql::Object]
impl BlogTag {
    /// Unique identifier of the blog tag.
    pub async fn id(&self) -> Result<String, async_graphql::Error> {
        Ok(self.id.clone())
    }

    /// Name of the blog tag.
    pub async fn name(&self) -> Result<String, async_graphql::Error> {
        Ok(self.name.clone())
    }

    /// Color of the blog tag.
    pub async fn color(&self) -> Result<String, async_graphql::Error> {
        Ok(self.color.clone())
    }

    /// Blogs associated with this tag.
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

/// Status options for the blog.
#[derive(Debug, Clone, Copy, PartialEq, Eq, async_graphql::Enum)]
pub enum Status {
    /// Work in progress; not ready to be published.
    Draft,
    /// Published and visible on the internet.
    Published,
    /// Written but unpublished for some reason.
    Archived,
}

#[async_graphql::Object]
impl Blog {
    /// Unique identifier of the blog.
    pub async fn id(&self) -> Result<String, async_graphql::Error> {
        Ok(self.id.clone())
    }

    /// Slug of the blog. Currently unused.
    pub async fn slug(&self) -> Result<String, async_graphql::Error> {
        Ok(self.slug.clone())
    }

    /// Title of the blog.
    pub async fn title(&self) -> Result<String, async_graphql::Error> {
        Ok(self.title.clone())
    }

    /// Description of the blog.
    pub async fn description(&self) -> Result<String, async_graphql::Error> {
        Ok(self.description.clone())
    }

    /// Signed S3 URL of the OGP image. Expires in 1 hour.
    pub async fn ogp_image_s3_url(&self) -> Result<Option<String>, async_graphql::Error> {
        Ok(self.ogp_image_s3_url.clone())
    }

    /// Tags associated with the blog.
    pub async fn tags(&self) -> Result<Vec<BlogTag>, async_graphql::Error> {
        Ok(self.tags.clone())
    }

    /// Publish status of the blog.
    pub async fn status(&self) -> Result<Status, async_graphql::Error> {
        Ok(self.status)
    }

    /// Keywords of the blog. Used to improve article searchability.
    pub async fn keywords(&self) -> Result<Vec<String>, async_graphql::Error> {
        Ok(self.keywords.clone())
    }

    /// RFC 3339-formatted creation timestamp.
    pub async fn created_at(&self) -> Result<String, async_graphql::Error> {
        Ok(self.created_at.clone())
    }

    /// RFC 3339-formatted last update timestamp.
    pub async fn updated_at(&self) -> Result<String, async_graphql::Error> {
        Ok(self.updated_at.clone())
    }

    /// Children blocks of the blog.
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
    /// Returns a blog by its page ID.
    pub async fn blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        page_id: String,
    ) -> Result<Blog, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let blog_entity = blog_service.get_blog_by_id(&page_id).await?;

        let blog = Blog::from(blog_entity);

        Ok(blog)
    }

    /// Returns all blogs.
    pub async fn blog_list(
        &self,
        ctx: &async_graphql::Context<'_>,
        language: BlogLanguage,
    ) -> Result<Vec<Blog>, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let blog_entities = blog_service
            .list_blogs(crate::service::blog::BlogLanguageServiceInput::from(
                language,
            ))
            .await?;

        let blogs = blog_entities
            .into_iter()
            .map(Blog::from)
            .collect::<Vec<Blog>>();

        Ok(blogs)
    }

    /// Returns a blog tag by its tag ID.
    pub async fn tag(
        &self,
        ctx: &async_graphql::Context<'_>,
        tag_id: String,
        language: BlogLanguage,
    ) -> Result<Option<BlogTag>, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let tag = blog_service
            .get_tag_by_id(
                &tag_id,
                crate::service::blog::BlogLanguageServiceInput::from(language),
            )
            .await?
            .map(BlogTag::from);

        Ok(tag)
    }

    /// Returns all blog tags.
    pub async fn tag_list(
        &self,
        ctx: &async_graphql::Context<'_>,
        language: BlogLanguage,
    ) -> Result<Vec<BlogTag>, async_graphql::Error> {
        let blog_service = ctx.data::<crate::service::blog::BlogService>()?;

        let tags = blog_service
            .list_tags(crate::service::blog::BlogLanguageServiceInput::from(
                language,
            ))
            .await?;

        let blog_tags = tags
            .into_iter()
            .map(BlogTag::from)
            .collect::<Vec<BlogTag>>();

        Ok(blog_tags)
    }
}
