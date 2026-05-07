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

impl Into<u32> for BlogImageSizeQueryParam {
    fn into(self) -> u32 {
        match self {
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
