#[derive(Debug, Clone, serde::Serialize, utoipa::ToSchema)]
pub struct BlogResponse {
    /// Notion page ID
    pub page_id: String,

    /// The URL of the Notion page
    pub notion_url: String,

    /// The URL of the OGP image hosted on S3 by notion
    pub ogp_image_s3_signed_url: Option<String>,

    /// The slug of the blog, which appears as part of the URL
    pub slug: String,

    /// Whether this blog is featured (displayed on the blog home page)
    pub featured: bool,

    /// The IDs of the tags referenced
    pub tag_ids: Vec<String>,

    /// The status of the blog
    pub status: BlogStatusresponse,

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

impl From<super::entity::BlogEntity> for BlogResponse {
    fn from(value: super::entity::BlogEntity) -> Self {
        BlogResponse {
            page_id: value.page_id,
            notion_url: value.notion_url,
            ogp_image_s3_signed_url: value.ogp_image_s3_signed_url,
            slug: value.slug,
            featured: value.featured,
            tag_ids: value.tag_ids,
            status: BlogStatusresponse::from(value.status),
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
pub enum BlogStatusresponse {
    Draft,
    Archived,
    Private,
    Published,
}

impl From<super::entity::BlogStatusEntity> for BlogStatusresponse {
    fn from(value: super::entity::BlogStatusEntity) -> Self {
        match value {
            super::entity::BlogStatusEntity::Draft => BlogStatusresponse::Draft,
            super::entity::BlogStatusEntity::Archived => BlogStatusresponse::Archived,
            super::entity::BlogStatusEntity::Private => BlogStatusresponse::Private,
            super::entity::BlogStatusEntity::Published => BlogStatusresponse::Published,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, utoipa::ToSchema)]
pub struct BlogContentsResponse {
    pub meta: BlogResponse,
    pub components: Vec<serde_json::Value>,
}

impl From<super::entity::BlogContentsEntity> for BlogContentsResponse {
    fn from(value: super::entity::BlogContentsEntity) -> Self {
        BlogContentsResponse {
            meta: BlogResponse::from(value.meta),
            components: value
                .components
                .into_iter()
                .map(|e| serde_json::to_value(&e).unwrap())
                .collect::<Vec<serde_json::Value>>(),
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

impl From<super::entity::BlogTagEntity> for BlogTagResponse {
    fn from(value: super::entity::BlogTagEntity) -> Self {
        BlogTagResponse {
            id: value.id,
            name_en: value.name_en,
            name_ja: value.name_ja,
            icon_url: value.icon_url,
        }
    }
}
