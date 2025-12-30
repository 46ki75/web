use http::header::ACCEPT_LANGUAGE;

// CDN: 1 year, Client: 10 minutes // TODO: ↓ temporary setting (0), adjust later
static CACHE_VALUE: &str = "public, max-age=0, s-maxage=31536000";

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "snake_case")]
pub struct BlogOgImageQueryParam {
    pub lang: Option<BlogLanguageQueryParam>,
}

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum BlogLanguageQueryParam {
    En,
    Ja,
}

#[utoipa::path(
    get,
    path = "/api/v2/blog",
    params(
         ("accept-language" = String , Header),
    ),
    responses(
        (status = 200, description = "Blogs", body = Vec<super::response::BlogResponse>),
        (status = 400, description = "Bad request", body = String)
    )
)]
pub async fn list_blogs(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
    headers: http::header::HeaderMap,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = headers
        .get(ACCEPT_LANGUAGE)
        .and_then(|accept_language| accept_language.to_str().ok())
        .map(|accept_language| match accept_language {
            "ja" => super::entity::BlogLanguageEntity::Ja,
            _ => super::entity::BlogLanguageEntity::En,
        })
        .unwrap_or(super::entity::BlogLanguageEntity::En);

    let blogs = match state.blog_use_case.list_blogs(language).await {
        Ok(blog_entities) => {
            let response = blog_entities
                .into_iter()
                .map(|b| super::response::BlogResponse::from(b))
                .collect::<Vec<super::response::BlogResponse>>();

            let json = match serde_json::to_string(&response) {
                Ok(j) => j,
                Err(e) => {
                    return Err((
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to serialize response: {}", e),
                    ));
                }
            };
            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, "application/json")
                .header(http::header::VARY, "Accept-Language")
                .header(http::header::CACHE_CONTROL, CACHE_VALUE)
                .body(axum::body::Body::from(json))
                .map_err(|e| {
                    (
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to build response: {}", e),
                    )
                })?;

            Ok(response)
        }
        Err(e) => Err(e.as_client_response()),
    };

    blogs
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/{slug}",
    params(
        ("slug" = String, Path, description = "Blog slug"),
        ("accept-language" = String, Header),
    ),
    responses(
        (status = 200, description = "Blog Contents", body = super::response::BlogContentsResponse),
        (status = 400, description = "Bad request", body = String)
    ),
)]
pub async fn get_blog_contents(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
    axum::extract::Path(slug): axum::extract::Path<String>,
    headers: http::header::HeaderMap,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = headers
        .get(ACCEPT_LANGUAGE)
        .and_then(|accept_language| accept_language.to_str().ok())
        .map(|accept_language| match accept_language {
            "ja" => super::entity::BlogLanguageEntity::Ja,
            _ => super::entity::BlogLanguageEntity::En,
        })
        .unwrap_or(super::entity::BlogLanguageEntity::En);

    let contents = match state.blog_use_case.get_blog_contents(&slug, language).await {
        Ok(entity) => {
            let blog_content_response = super::response::BlogContentsResponse::from(entity);

            let json = match serde_json::to_string(&blog_content_response) {
                Ok(j) => j,
                Err(e) => {
                    return Err((
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to serialize response: {}", e),
                    ));
                }
            };
            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, "application/json")
                .header(http::header::VARY, "Accept-Language")
                .header(http::header::CACHE_CONTROL, CACHE_VALUE)
                .body(axum::body::Body::from(json))
                .map_err(|e| {
                    (
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to build response: {}", e),
                    )
                })?;

            Ok(response)
        }
        Err(e) => Err(e.as_client_response()),
    };

    contents
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/tag",
    responses(
        (status = 200, description = "Blog tags", body = Vec<super::response::BlogTagResponse>),
        (status = 400, description = "Bad request", body = String)
    ),
)]
pub async fn list_tags(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let tags = match state.blog_use_case.list_tags().await {
        Ok(tag_entities) => {
            let response = tag_entities
                .into_iter()
                .map(|t| super::response::BlogTagResponse::from(t))
                .collect::<Vec<super::response::BlogTagResponse>>();

            let json = match serde_json::to_string(&response) {
                Ok(j) => j,
                Err(e) => {
                    return Err((
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to serialize response: {}", e),
                    ));
                }
            };
            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, "application/json")
                .header(http::header::CACHE_CONTROL, CACHE_VALUE)
                .body(axum::body::Body::from(json))
                .map_err(|e| {
                    (
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to build response: {}", e),
                    )
                })?;

            Ok(response)
        }
        Err(e) => Err(e.as_client_response()),
    };

    tags
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/{slug}/og-image",
    params(
        ("slug" = String, Path, description = "Blog slug"),
        ("accept-language" = Option<String>, Header),
        ("lang" = Option<String>, Query),
    ),
    responses(
        (status = 200, description = "Blog Contents", body = Vec<u8>),
        (status = 400, description = "Bad request", body = String)
    ),
)]
pub async fn get_blog_og_image(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
    axum::extract::Path(slug): axum::extract::Path<String>,
    headers: http::header::HeaderMap,
    axum::extract::Query(BlogOgImageQueryParam { lang }): axum::extract::Query<
        BlogOgImageQueryParam,
    >,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = lang
        .map(|query_lang| match query_lang {
            BlogLanguageQueryParam::Ja => super::entity::BlogLanguageEntity::Ja,
            BlogLanguageQueryParam::En => super::entity::BlogLanguageEntity::En,
        })
        .unwrap_or_else(|| {
            headers
                .get(ACCEPT_LANGUAGE)
                .and_then(|accept_language| accept_language.to_str().ok())
                .map(|accept_language| match accept_language {
                    "ja" => super::entity::BlogLanguageEntity::Ja,
                    _ => super::entity::BlogLanguageEntity::En,
                })
                .unwrap_or(super::entity::BlogLanguageEntity::En)
        });

    let contents = match state
        .blog_use_case
        .fetch_ogp_image_by_slug(&slug, language.clone())
        .await
    {
        Ok(image_bytes) => {
            let content_type = state.blog_use_case.infer_mime_type(&image_bytes);

            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, content_type)
                .header(http::header::VARY, "Accept-Language")
                .header(http::header::CACHE_CONTROL, CACHE_VALUE)
                .body(axum::body::Body::from(image_bytes.to_vec()))
                .map_err(|e| {
                    (
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to build response: {}", e),
                    )
                })?;

            Ok(response)
        }
        Err(e) => Err(e.as_client_response()),
    };

    contents
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/{slug}/block-image/{block_id}",
    params(
        ("slug" = String, Path, description = "Blog slug"),
        ("block_id" = String, Path, description = "Notion block id"),
    ),
    responses(
        (status = 200, description = "Blog Contents", body = Vec<u8>),
        (status = 400, description = "Bad request", body = String)
    ),
)]
pub async fn get_blog_block_image(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
    axum::extract::Path((_slug, block_id)): axum::extract::Path<(String, String)>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let contents = match state.blog_use_case.fetch_block_image_by_id(&block_id).await {
        Ok(image_bytes) => {
            let content_type = state.blog_use_case.infer_mime_type(&image_bytes);

            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, content_type)
                .header(http::header::CACHE_CONTROL, CACHE_VALUE)
                .body(axum::body::Body::from(image_bytes.to_vec()))
                .map_err(|e| {
                    (
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to build response: {}", e),
                    )
                })?;

            Ok(response)
        }
        Err(e) => Err(e.as_client_response()),
    };

    contents
}
