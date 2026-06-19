use http::header::ACCEPT_LANGUAGE;

pub mod request;
pub mod response;

// CDN: 1 year, Client: 10 minutes // TODO: ↓ temporary setting (0), adjust later
static CACHE_VALUE: &str = "public, max-age=0, s-maxage=31536000";
static IMMUTABLE_CACHE_VALUE: &str = "public, max-age=31536000, s-maxage=31536000, immutable";

/// Errors produced by the blog controller layer.
///
/// This is the single place that decides HTTP status codes and log emission.
/// Lower layers return errors silently; the controller maps them to status codes
/// here and logs them once via the [`axum::response::IntoResponse`] impl.
#[derive(Debug, thiserror::Error)]
pub enum BlogControllerError {
    #[error(transparent)]
    UseCase(#[from] super::use_case::BlogUseCaseError),

    #[error("blog cache object not found: {0}")]
    NotFound(String),

    #[error("blog cache storage error: {0}")]
    Storage(#[from] super::publisher::PublisherError),

    #[error("response build error: {0}")]
    ResponseBuild(#[from] http::Error),
}

impl axum::response::IntoResponse for BlogControllerError {
    fn into_response(self) -> axum::response::Response {
        use axum::http::StatusCode;
        use super::repository::BlogRepositoryError;
        use super::use_case::BlogUseCaseError;

        let status = match &self {
            Self::UseCase(e) => match e {
                BlogUseCaseError::NotFound(_) => StatusCode::NOT_FOUND,
                BlogUseCaseError::OgpCoverNotSet { .. } => StatusCode::BAD_REQUEST,
                BlogUseCaseError::Repository(r) => match r {
                    BlogRepositoryError::NotionToJarkup(_) => StatusCode::BAD_REQUEST,
                    BlogRepositoryError::PagePropertyNotFound(_) => StatusCode::BAD_REQUEST,
                    BlogRepositoryError::InvalidSchema(_) => StatusCode::BAD_REQUEST,
                    BlogRepositoryError::NotionRecord(_) => StatusCode::BAD_REQUEST,
                    BlogRepositoryError::FetchImage(_) => StatusCode::INTERNAL_SERVER_ERROR,
                    BlogRepositoryError::NotionApi(_) => StatusCode::BAD_GATEWAY,
                    BlogRepositoryError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
                },
                BlogUseCaseError::SerializeXml(_)
                | BlogUseCaseError::ImageConversion(_)
                | BlogUseCaseError::Io(_)
                | BlogUseCaseError::SerdeJson(_)
                | BlogUseCaseError::Time(_)
                | BlogUseCaseError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
            },
            Self::NotFound(_) => StatusCode::NOT_FOUND,
            Self::Storage(_) | Self::ResponseBuild(_) => StatusCode::INTERNAL_SERVER_ERROR,
        };

        tracing::error!(error = ?self, "request failed");
        let body = serde_json::json!({ "error": self.to_string() });
        (status, axum::Json(body)).into_response()
    }
}

/// Selects the cache language suffix (`en`/`ja`) from the `Accept-Language` header.
fn lang_from_headers(headers: &http::header::HeaderMap) -> &'static str {
    match headers
        .get(ACCEPT_LANGUAGE)
        .and_then(|accept_language| accept_language.to_str().ok())
    {
        Some("ja") => "ja",
        _ => "en",
    }
}

/// Selects the cache language suffix (`en`/`ja`) from a path parameter.
fn lang_from_path(language: &str) -> &'static str {
    match language {
        "ja" => "ja",
        _ => "en",
    }
}

/// Streams a pre-materialized object from the blog cache bucket.
///
/// This is the read side of the read-through cache: the slow Notion transform
/// happened at publish time, so reads are a single S3 GET with no upstream call.
async fn serve_cached(
    state: &super::router::BlogState,
    key: &str,
    content_type: &str,
    vary_accept_language: bool,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    let bytes = state
        .storage
        .get(key)
        .await?
        .ok_or_else(|| BlogControllerError::NotFound(key.to_owned()))?;

    let mut builder = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, content_type)
        .header(http::header::CACHE_CONTROL, CACHE_VALUE);

    if vary_accept_language {
        builder = builder.header(http::header::VARY, "Accept-Language");
    }

    Ok(builder.body(axum::body::Body::from(bytes))?)
}

/// Streams a pre-materialized image from the blog cache bucket, echoing the
/// `Content-Type` stored at publish time (WebP for raster, SVG for vector).
async fn serve_cached_image(
    state: &super::router::BlogState,
    key: &str,
    cache_value: &str,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    let (bytes, content_type) = state
        .storage
        .get_object(key)
        .await?
        .ok_or_else(|| BlogControllerError::NotFound(key.to_owned()))?;

    let content_type = content_type.unwrap_or_else(|| "application/octet-stream".to_owned());

    Ok(axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, content_type)
        .header(http::header::CACHE_CONTROL, cache_value)
        .body(axum::body::Body::from(bytes))?)
}

#[utoipa::path(
    get,
    path = "/api/v2/blog",
    tag = "blog",
    params(
         ("accept-language" = String , Header),
    ),
    responses(
        (status = 200, description = "Blogs", body = Vec<response::BlogResponse>),
        (status = 502, description = "Upstream error"),
        (status = 500, description = "Internal error"),
    )
)]
pub async fn list_blogs(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::BlogState>>,
    headers: http::header::HeaderMap,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    let lang = lang_from_headers(&headers);
    serve_cached(
        &state,
        &format!("cache/blog/list/{lang}.json"),
        "application/json",
        true,
    )
    .await
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/{slug}",
    tag = "blog",
    params(
        ("slug" = String, Path, description = "Blog slug"),
        ("accept-language" = String, Header),
    ),
    responses(
        (status = 200, description = "Blog Contents", body = response::BlogContentsResponse),
        (status = 404, description = "Blog not found"),
        (status = 502, description = "Upstream error"),
        (status = 500, description = "Internal error"),
    ),
)]
pub async fn get_blog_contents(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::BlogState>>,
    axum::extract::Path(slug): axum::extract::Path<String>,
    headers: http::header::HeaderMap,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    let lang = lang_from_headers(&headers);
    serve_cached(
        &state,
        &format!("cache/blog/contents/{slug}/{lang}.json"),
        "application/json",
        true,
    )
    .await
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/tag",
    tag = "blog",
    responses(
        (status = 200, description = "Blog tags", body = Vec<response::BlogTagResponse>),
        (status = 502, description = "Upstream error"),
        (status = 500, description = "Internal error"),
    ),
)]
pub async fn list_tags(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::BlogState>>,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    serve_cached(&state, "cache/blog/tags.json", "application/json", false).await
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/{slug}/og-image",
    tag = "blog",
    params(
        ("slug" = String, Path, description = "Blog slug"),
        ("lang" = Option<String>, Query),
    ),
    responses(
        (status = 200, description = "OGP image", body = Vec<u8>),
        (status = 404, description = "Blog not found or cover not set"),
        (status = 502, description = "Upstream error"),
        (status = 500, description = "Internal error"),
    ),
)]
pub async fn get_blog_og_image(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::BlogState>>,
    axum::extract::Path(slug): axum::extract::Path<String>,
    axum::extract::Query(request::BlogOgImageQueryParam { lang }): axum::extract::Query<
        request::BlogOgImageQueryParam,
    >,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    let lang = match lang {
        Some(request::BlogLanguageQueryParam::Ja) => "ja",
        _ => "en",
    };
    serve_cached_image(
        &state,
        &format!("cache/blog/{slug}/og-image/{lang}"),
        CACHE_VALUE,
    )
    .await
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/block-image/{block_id}",
    tag = "blog",
    params(
        ("block_id" = String, Path, description = "Notion block id"),
        ("size" = Option<request::BlogImageSizeQueryParam>, Query, description = "size preset name"),
    ),
    responses(
        (status = 200, description = "Block image", body = Vec<u8>),
        (status = 502, description = "Upstream error"),
        (status = 500, description = "Internal error"),
    ),
)]
pub async fn get_blog_block_image(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::BlogState>>,
    axum::extract::Path(block_id): axum::extract::Path<String>,
    axum::extract::Query(request::BlogBlockImageQueryParam { size }): axum::extract::Query<
        request::BlogBlockImageQueryParam,
    >,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    let variant = match size {
        Some(request::BlogImageSizeQueryParam::Small) => "small",
        Some(request::BlogImageSizeQueryParam::Medium) => "medium",
        Some(request::BlogImageSizeQueryParam::Large) => "large",
        None => "default",
    };
    serve_cached_image(
        &state,
        &format!("cache/blog/block-image/{block_id}/{variant}"),
        IMMUTABLE_CACHE_VALUE,
    )
    .await
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/sitemap.xml",
    tag = "blog",
    responses(
        (status = 200, description = "Blog Sitemap", body = String, content_type = "application/xml"),
        (status = 502, description = "Upstream error"),
        (status = 500, description = "Internal error"),
    ),
)]
pub async fn get_blog_sitemap(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::BlogState>>,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    serve_cached(&state, "cache/blog/sitemap.xml", "application/xml", false).await
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/feed/rss/{language}",
    tag = "blog",
    responses(
        (status = 200, description = "Blog RSS Feed", body = String, content_type = "application/xml"),
        (status = 502, description = "Upstream error"),
        (status = 500, description = "Internal error"),
    ),
)]
pub async fn get_blog_rss_feed(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::BlogState>>,
    axum::extract::Path(language): axum::extract::Path<String>,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    let lang = lang_from_path(&language);
    serve_cached(
        &state,
        &format!("cache/blog/feed/rss/{lang}.xml"),
        "application/xml",
        false,
    )
    .await
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/feed/atom/{language}",
    tag = "blog",
    responses(
        (status = 200, description = "Blog Atom Feed", body = String, content_type = "application/xml"),
        (status = 502, description = "Upstream error"),
        (status = 500, description = "Internal error"),
    ),
)]
pub async fn get_blog_atom_feed(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::BlogState>>,
    axum::extract::Path(language): axum::extract::Path<String>,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    let lang = lang_from_path(&language);
    serve_cached(
        &state,
        &format!("cache/blog/feed/atom/{lang}.xml"),
        "application/xml",
        false,
    )
    .await
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/feed/json-feed/{language}",
    tag = "blog",
    responses(
        (status = 200, description = "Blog JSONFeed", body = String, content_type = "application/json"),
        (status = 502, description = "Upstream error"),
        (status = 500, description = "Internal error"),
    ),
)]
pub async fn get_blog_json_feed(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<super::router::BlogState>>,
    axum::extract::Path(language): axum::extract::Path<String>,
) -> Result<axum::response::Response<axum::body::Body>, BlogControllerError> {
    let lang = lang_from_path(&language);
    serve_cached(
        &state,
        &format!("cache/blog/feed/json-feed/{lang}.json"),
        "application/json",
        false,
    )
    .await
}
