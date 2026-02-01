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
    axum::extract::Query(BlogOgImageQueryParam { lang }): axum::extract::Query<
        BlogOgImageQueryParam,
    >,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = lang
        .map(|query_lang| match query_lang {
            BlogLanguageQueryParam::Ja => super::entity::BlogLanguageEntity::Ja,
            BlogLanguageQueryParam::En => super::entity::BlogLanguageEntity::En,
        })
        .unwrap_or(super::entity::BlogLanguageEntity::En);

    let contents = match state
        .blog_use_case
        .fetch_ogp_image_by_slug(&slug, language.clone())
        .await
    {
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

#[utoipa::path(
    get,
    path = "/api/v2/blog/sitemap.xml",
    responses(
        (status = 200, description = "Blog Sitemap", body = String, content_type = "application/xml"),
    ),
)]
pub async fn get_blog_sitemap(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let sitemap = match state.blog_use_case.generate_sitemap().await {
        Ok(sitemap_xml) => {
            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, "application/xml")
                .header(http::header::CACHE_CONTROL, CACHE_VALUE)
                .body(axum::body::Body::from(sitemap_xml))
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

    sitemap
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/feed/rss/{language}",
    responses(
        (status = 200, description = "Blog RSS Feed", body = String, content_type = "application/xml"),
    ),
)]
pub async fn get_blog_rss_feed(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
    axum::extract::Path(language): axum::extract::Path<String>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = match language.as_str() {
        "ja" => super::entity::BlogLanguageEntity::Ja,
        _ => super::entity::BlogLanguageEntity::En,
    };

    let rss_feed = match state.blog_use_case.generate_rss(language).await {
        Ok(rss_feed) => {
            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, "application/xml")
                .header(http::header::CACHE_CONTROL, CACHE_VALUE)
                .body(axum::body::Body::from(rss_feed))
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

    rss_feed
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/feed/atom/{language}",
    responses(
        (status = 200, description = "Blog Atom Feed", body = String, content_type = "application/xml"),
    ),
)]
pub async fn get_blog_atom_feed(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
    axum::extract::Path(language): axum::extract::Path<String>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = match language.as_str() {
        "ja" => super::entity::BlogLanguageEntity::Ja,
        _ => super::entity::BlogLanguageEntity::En,
    };

    let atom_feed = match state.blog_use_case.generate_atom(language).await {
        Ok(atom_feed) => {
            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, "application/xml")
                .header(http::header::CACHE_CONTROL, CACHE_VALUE)
                .body(axum::body::Body::from(atom_feed))
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

    atom_feed
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/feed/json-feed/{language}",
    responses(
        (status = 200, description = "Blog JSONFeed", body = String, content_type = "application/json"),
    ),
)]
pub async fn get_blog_json_feed(
    axum::extract::State(state): axum::extract::State<
        std::sync::Arc<crate::axum_router::AxumAppState>,
    >,
    axum::extract::Path(language): axum::extract::Path<String>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = match language.as_str() {
        "ja" => super::entity::BlogLanguageEntity::Ja,
        _ => super::entity::BlogLanguageEntity::En,
    };

    let json_feed = match state.blog_use_case.generate_jsonfeed(language).await {
        Ok(json_feed) => {
            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, "application/json")
                .header(http::header::CACHE_CONTROL, CACHE_VALUE)
                .body(axum::body::Body::from(json_feed))
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

    json_feed
}
