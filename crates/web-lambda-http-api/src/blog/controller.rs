#[derive(Debug, serde::Deserialize)]
pub struct Query {
    language: Language,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Language {
    En,
    Ja,
}

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
            let response = axum::response::Response::builder()
                .header(http::header::CONTENT_TYPE, "application/json")
                .body(axum::body::Body::from(serde_json::to_string(&b).unwrap()))
                .unwrap();

            Ok(response)
        }
        Err(e) => Err(e.as_client_response()),
    };

    blogs
}
