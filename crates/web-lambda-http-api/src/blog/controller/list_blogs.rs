#[derive(serde::Deserialize)]
pub struct ListBlogsQuery {
    language: Language,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Language {
    En,
    Ja,
}

pub async fn list_blogs(
    language: axum::extract::Query<ListBlogsQuery>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    todo!()
}
