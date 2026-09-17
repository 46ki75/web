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

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum BlogImageSizeQueryParam {
    Small,
    Medium,
    Large,
}

impl From<BlogImageSizeQueryParam> for u32 {
    fn from(size: BlogImageSizeQueryParam) -> Self {
        match size {
            BlogImageSizeQueryParam::Small => 500,
            BlogImageSizeQueryParam::Medium => 800,
            BlogImageSizeQueryParam::Large => 1200,
        }
    }
}

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
pub struct BlogBlockImageQueryParam {
    pub size: Option<BlogImageSizeQueryParam>,
}
