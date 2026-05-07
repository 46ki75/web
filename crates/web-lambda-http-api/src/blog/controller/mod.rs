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

    #[error("response serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

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
            Self::Serialization(_) | Self::ResponseBuild(_) => StatusCode::INTERNAL_SERVER_ERROR,
        };

        tracing::error!(error = ?self, "request failed");
        let body = serde_json::json!({ "error": self.to_string() });
        (status, axum::Json(body)).into_response()
    }
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
    let language = headers
        .get(ACCEPT_LANGUAGE)
        .and_then(|accept_language| accept_language.to_str().ok())
        .map(|accept_language| match accept_language {
            "ja" => super::use_case::input::BlogLanguageEntity::Ja,
            _ => super::use_case::input::BlogLanguageEntity::En,
        })
        .unwrap_or(super::use_case::input::BlogLanguageEntity::En);

    let blog_entities = state.blog_use_case.list_blogs(language).await?;

    let response_body = blog_entities
        .into_iter()
        .map(response::BlogResponse::from)
        .collect::<Vec<response::BlogResponse>>();

    let json = serde_json::to_string(&response_body)?;

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, "application/json")
        .header(http::header::VARY, "Accept-Language")
        .header(http::header::CACHE_CONTROL, CACHE_VALUE)
        .body(axum::body::Body::from(json))?;

    Ok(response)
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
    let language = headers
        .get(ACCEPT_LANGUAGE)
        .and_then(|accept_language| accept_language.to_str().ok())
        .map(|accept_language| match accept_language {
            "ja" => super::use_case::input::BlogLanguageEntity::Ja,
            _ => super::use_case::input::BlogLanguageEntity::En,
        })
        .unwrap_or(super::use_case::input::BlogLanguageEntity::En);

    let entity = state.blog_use_case.get_blog_contents(&slug, language).await?;

    let blog_content_response = response::BlogContentsResponse::from(entity);

    let json = serde_json::to_string(&blog_content_response)?;

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, "application/json")
        .header(http::header::VARY, "Accept-Language")
        .header(http::header::CACHE_CONTROL, CACHE_VALUE)
        .body(axum::body::Body::from(json))?;

    Ok(response)
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
    let tag_entities = state.blog_use_case.list_tags().await?;

    let response_body = tag_entities
        .into_iter()
        .map(response::BlogTagResponse::from)
        .collect::<Vec<response::BlogTagResponse>>();

    let json = serde_json::to_string(&response_body)?;

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, "application/json")
        .header(http::header::CACHE_CONTROL, CACHE_VALUE)
        .body(axum::body::Body::from(json))?;

    Ok(response)
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
    let language = lang
        .map(|query_lang| match query_lang {
            request::BlogLanguageQueryParam::Ja => super::use_case::input::BlogLanguageEntity::Ja,
            request::BlogLanguageQueryParam::En => super::use_case::input::BlogLanguageEntity::En,
        })
        .unwrap_or(super::use_case::input::BlogLanguageEntity::En);

    let image_bytes = state
        .blog_use_case
        .fetch_ogp_image_by_slug(&slug, language.clone())
        .await
        .and_then(|contents| state.blog_use_case.convert_image(&contents, Some(1200)))?;

    let content_type = state.blog_use_case.infer_image_mime_type(&image_bytes);

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, content_type)
        .header(http::header::CACHE_CONTROL, CACHE_VALUE)
        .body(axum::body::Body::from(image_bytes.to_vec()))?;

    Ok(response)
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
    let image_bytes = state
        .blog_use_case
        .fetch_block_image_by_id(&block_id)
        .await
        .and_then(|bytes| {
            state
                .blog_use_case
                .convert_image(&bytes, size.map(|size| size.into()))
        })?;

    let content_type = state.blog_use_case.infer_image_mime_type(&image_bytes);

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, content_type)
        .header(http::header::CACHE_CONTROL, IMMUTABLE_CACHE_VALUE)
        .body(axum::body::Body::from(image_bytes.to_vec()))?;

    Ok(response)
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
    let sitemap_xml = state.blog_use_case.generate_sitemap().await?;

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, "application/xml")
        .header(http::header::CACHE_CONTROL, CACHE_VALUE)
        .body(axum::body::Body::from(sitemap_xml))?;

    Ok(response)
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
    let language = match language.as_str() {
        "ja" => super::use_case::input::BlogLanguageEntity::Ja,
        _ => super::use_case::input::BlogLanguageEntity::En,
    };

    let rss_feed = state.blog_use_case.generate_rss(language).await?;

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, "application/xml")
        .header(http::header::CACHE_CONTROL, CACHE_VALUE)
        .body(axum::body::Body::from(rss_feed))?;

    Ok(response)
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
    let language = match language.as_str() {
        "ja" => super::use_case::input::BlogLanguageEntity::Ja,
        _ => super::use_case::input::BlogLanguageEntity::En,
    };

    let atom_feed = state.blog_use_case.generate_atom(language).await?;

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, "application/xml")
        .header(http::header::CACHE_CONTROL, CACHE_VALUE)
        .body(axum::body::Body::from(atom_feed))?;

    Ok(response)
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
    let language = match language.as_str() {
        "ja" => super::use_case::input::BlogLanguageEntity::Ja,
        _ => super::use_case::input::BlogLanguageEntity::En,
    };

    let json_feed = state.blog_use_case.generate_jsonfeed(language).await?;

    let response = axum::response::Response::builder()
        .header(http::header::CONTENT_TYPE, "application/json")
        .header(http::header::CACHE_CONTROL, CACHE_VALUE)
        .body(axum::body::Body::from(json_feed))?;

    Ok(response)
}
