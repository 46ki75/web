#[derive(Debug, serde::Deserialize, utoipa::ToSchema, utoipa::IntoParams)]
pub struct Query {
    language: Language,
}

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum Language {
    En,
    Ja,
}

#[utoipa::path(
    get,
    path = "/api/v2/blog",
    params(Query),
    responses(
        (status = 200, description = "Blogs", body = Vec<super::response::BlogResponse>),
        (status = 400, description = "Bad request", body = String)
    )
)]
pub async fn list_blogs(
    axum::extract::State(blog_service): axum::extract::State<
        std::sync::Arc<super::use_case::BlogUseCase>,
    >,
    query: axum::extract::Query<Query>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let language = match query.language {
        Language::En => super::entity::BlogLanguageEntity::En,
        Language::Ja => super::entity::BlogLanguageEntity::Ja,
    };

    let blogs = match blog_service.list_blogs(language).await {
        Ok(b) => {
            let json = match serde_json::to_string(&b) {
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
                .unwrap();

            Ok(response)
        }
        Err(e) => Err(e.as_client_response()),
    };

    blogs
}
