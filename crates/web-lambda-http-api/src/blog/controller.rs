#[derive(Debug, serde::Deserialize, utoipa::ToSchema, utoipa::IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListBlogsQuery {
    #[param(inline)]
    language: BlogLanguageQueryParam,
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
    params(ListBlogsQuery),
    responses(
        (status = 200, description = "Blogs", body = Vec<super::response::BlogResponse>),
        (status = 400, description = "Bad request", body = String)
    )
)]
pub async fn list_blogs(
    axum::extract::State(blog_service): axum::extract::State<
        std::sync::Arc<super::use_case::BlogUseCase>,
    >,
    query: axum::extract::Query<ListBlogsQuery>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = match query.language {
        BlogLanguageQueryParam::En => super::entity::BlogLanguageEntity::En,
        BlogLanguageQueryParam::Ja => super::entity::BlogLanguageEntity::Ja,
    };

    let blogs = match blog_service.list_blogs(language).await {
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

#[derive(Debug, serde::Deserialize, utoipa::ToSchema, utoipa::IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetBlogContentsQuery {
    #[param(inline)]
    language: BlogLanguageQueryParam,
}

#[utoipa::path(
    get,
    path = "/api/v2/blog/{slug}",
    params(
        ("slug" = String, Path, description = "Blog slug"),
        GetBlogContentsQuery
    ),
    responses(
        (status = 200, description = "Blog Contents", body = Vec<super::response::BlogContentsResponse>),
        (status = 400, description = "Bad request", body = String)
    ),
)]
pub async fn get_blog_contents(
    axum::extract::State(blog_service): axum::extract::State<
        std::sync::Arc<super::use_case::BlogUseCase>,
    >,
    axum::extract::Path(slug): axum::extract::Path<String>,
    query: axum::extract::Query<GetBlogContentsQuery>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = match query.language {
        BlogLanguageQueryParam::En => super::entity::BlogLanguageEntity::En,
        BlogLanguageQueryParam::Ja => super::entity::BlogLanguageEntity::Ja,
    };

    let contents = match blog_service.get_blog_contents(&slug, language).await {
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
    axum::extract::State(blog_service): axum::extract::State<
        std::sync::Arc<super::use_case::BlogUseCase>,
    >,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let tags = match blog_service.list_tags().await {
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
