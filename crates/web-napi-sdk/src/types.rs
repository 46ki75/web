#[derive(Debug, Clone)]
#[napi_derive::napi]
pub struct Blog {
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
    pub status: Status,

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

#[derive(Debug, Clone)]
#[napi_derive::napi]
pub enum Status {
    Draft,
    Archived,
    Private,
    Published,
}

#[derive(Debug, Clone)]
#[napi_derive::napi]
pub enum Language {
    En,
    Ja,
}

#[derive(Debug, Clone)]
#[napi_derive::napi]
pub struct Tag {
    pub id: String,
    pub name_en: String,
    pub name_ja: String,
    pub icon_url: Option<String>,
}
