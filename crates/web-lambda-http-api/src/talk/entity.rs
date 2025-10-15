#[derive(Debug, Clone)]
pub struct TalkEntity {
    pub id: String,
    pub title: String,
    pub image: String,
    pub url: String,
    pub location: String,
    pub date: String,
    pub language: TalkLanguageEntity,
}

impl From<super::dto::TalkDto> for TalkEntity {
    fn from(value: super::dto::TalkDto) -> Self {
        Self {
            id: value.id,
            title: value.title,
            image: value.image,
            url: value.url,
            location: value.location,
            date: value.date,
            language: value.language.into(),
        }
    }
}

#[derive(Debug, Clone)]
pub enum TalkLanguageEntity {
    En,
    Ja,
}

impl From<super::dto::TalkLanguageDto> for TalkLanguageEntity {
    fn from(value: super::dto::TalkLanguageDto) -> Self {
        match value {
            super::dto::TalkLanguageDto::En => TalkLanguageEntity::En,
            super::dto::TalkLanguageDto::Ja => TalkLanguageEntity::Ja,
        }
    }
}
