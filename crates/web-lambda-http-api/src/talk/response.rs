#[derive(Debug, Clone, serde::Serialize, utoipa::ToSchema)]
pub struct TalkResponse {
    pub title: String,
    pub image: String,
    pub url: String,
    pub location: String,
    pub date: String,
    pub language: TalkLanguageResponse,
}

impl From<super::entity::TalkEntity> for TalkResponse {
    fn from(value: super::entity::TalkEntity) -> Self {
        Self {
            title: value.title,
            image: value.image,
            url: value.url,
            location: value.location,
            date: value.date,
            language: value.language.into(),
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, utoipa::ToSchema)]
pub enum TalkLanguageResponse {
    #[serde(rename = "en")]
    En,
    #[serde(rename = "ja")]
    Ja,
}

impl From<super::entity::TalkLanguageEntity> for TalkLanguageResponse {
    fn from(value: super::entity::TalkLanguageEntity) -> Self {
        match value {
            super::entity::TalkLanguageEntity::En => TalkLanguageResponse::En,
            super::entity::TalkLanguageEntity::Ja => TalkLanguageResponse::Ja,
        }
    }
}
