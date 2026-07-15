#[derive(Debug, Clone, serde::Serialize, utoipa::ToSchema)]
pub struct BlogResponse {
    /// Notion page ID
    pub page_id: String,

    /// The URL of the Notion page
    pub notion_url: String,

    /// The slug of the blog, which appears as part of the URL
    pub slug: String,

    /// Whether this blog is featured (displayed on the blog home page)
    pub featured: bool,

    /// The IDs of the tags referenced
    pub tag_ids: Vec<String>,

    /// The status of the blog
    pub status: BlogStatusResponse,

    /// The title of the blog
    pub title: String,

    /// The description of the blog
    pub description: String,

    /// The keywords of the blog which are only used for searching
    pub keywords: Vec<String>,

    /// The date and time when the blog was created (ISO 3339)
    pub created_at: String,

    /// The date and time when the blog was updated (ISO 3339)
    pub updated_at: String,
}

impl From<crate::blog::use_case::output::BlogEntity> for BlogResponse {
    fn from(value: crate::blog::use_case::output::BlogEntity) -> Self {
        BlogResponse {
            page_id: value.page_id,
            notion_url: value.notion_url,
            slug: value.slug,
            featured: value.featured,
            tag_ids: value.tag_ids,
            status: BlogStatusResponse::from(value.status),
            title: value.title,
            description: value.description,
            keywords: value.keywords,
            created_at: value
                .created_at
                .format(&time::format_description::well_known::Rfc3339)
                .unwrap(),
            updated_at: value
                .updated_at
                .format(&time::format_description::well_known::Rfc3339)
                .unwrap(),
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, utoipa::ToSchema)]
pub enum BlogStatusResponse {
    Draft,
    Archived,
    Private,
    Published,
}

impl From<crate::blog::use_case::output::BlogStatusEntity> for BlogStatusResponse {
    fn from(value: crate::blog::use_case::output::BlogStatusEntity) -> Self {
        match value {
            crate::blog::use_case::output::BlogStatusEntity::Draft => BlogStatusResponse::Draft,
            crate::blog::use_case::output::BlogStatusEntity::Archived => {
                BlogStatusResponse::Archived
            }
            crate::blog::use_case::output::BlogStatusEntity::Private => BlogStatusResponse::Private,
            crate::blog::use_case::output::BlogStatusEntity::Published => {
                BlogStatusResponse::Published
            }
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, utoipa::ToSchema)]
pub struct BlogContentsResponse {
    pub meta: BlogResponse,
    pub surface: serde_json::Value,
}

impl From<crate::blog::use_case::output::BlogContentsEntity> for BlogContentsResponse {
    fn from(value: crate::blog::use_case::output::BlogContentsEntity) -> Self {
        BlogContentsResponse {
            meta: BlogResponse::from(value.meta),
            surface: serde_json::to_value(value.surface).expect("A2UI surface is serializable"),
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, utoipa::ToSchema)]
pub struct BlogTagResponse {
    pub id: String,
    pub name_en: String,
    pub name_ja: String,
    pub icon_url: Option<String>,
}

impl From<crate::blog::use_case::output::BlogTagEntity> for BlogTagResponse {
    fn from(value: crate::blog::use_case::output::BlogTagEntity) -> Self {
        BlogTagResponse {
            id: value.id,
            name_en: value.name_en,
            name_ja: value.name_ja,
            icon_url: value.icon_url,
        }
    }
}
