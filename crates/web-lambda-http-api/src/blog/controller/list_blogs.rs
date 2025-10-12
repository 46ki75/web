#[derive(serde::Deserialize)]
pub struct ListBlogsQuery {
    language: Language,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ListBlogsResponse {
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

#[derive(Debug, Clone, serde::Serialize)]
pub enum Status {
    Draft,
    Archived,
    Private,
    Published,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Language {
    En,
    Ja,
}

pub async fn list_blogs(
    query: axum::extract::Query<ListBlogsQuery>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let secret = std::env::var("NOTION_API_KEY").map_err(|_| {
        tracing::error!(
            "Failed to load environmental variable: {0}",
            "NOTION_API_KEY"
        );
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            "INTERNAL_SERVER_ERROR".to_owned(),
        )
    })?;

    let notionrs_client = notionrs::Client::new(secret.as_str());

    let blog_master_data_source_id = crate::once_cell_cache::ssm_parameter::blog_master_data_source_id::init_blog_master_data_source_id().await.map_err(|_|{
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR".to_owned(),
            )
        })?;

    let blogs = web_blog_sdk::command::list_blogs::list_blogs(
        notionrs_client,
        blog_master_data_source_id,
        match query.language {
            Language::En => web_blog_sdk::types::Language::En,
            Language::Ja => web_blog_sdk::types::Language::Ja,
        },
    )
    .await
    .map_err(|e| {
        tracing::error!("Failed to list blogs: {:?}", e);
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            "INTERNAL_SERVER_ERROR".to_owned(),
        )
    })?;

    let response_list: Vec<ListBlogsResponse> = blogs
        .into_iter()
        .map(|blog| ListBlogsResponse {
            page_id: blog.page_id,
            notion_url: blog.notion_url,
            ogp_image_s3_signed_url: blog.ogp_image_s3_signed_url,
            slug: blog.slug,
            featured: blog.featured,
            tag_ids: blog.tag_ids,
            status: match blog.status {
                web_blog_sdk::types::Status::Draft => Status::Draft,
                web_blog_sdk::types::Status::Archived => Status::Archived,
                web_blog_sdk::types::Status::Private => Status::Private,
                web_blog_sdk::types::Status::Published => Status::Published,
            },
            title: blog.title,
            description: blog.description,
            keywords: blog.keywords,
            created_at: blog.created_at,
            updated_at: blog.updated_at,
        })
        .collect();

    use axum::response::IntoResponse;
    Ok(axum::Json(response_list).into_response())
}
