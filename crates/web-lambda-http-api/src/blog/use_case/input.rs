use core::fmt;
use strum_macros::EnumIter;

#[derive(Debug, Clone, EnumIter)]
pub enum BlogLanguageEntity {
    En,
    Ja,
}

impl From<crate::blog::repository::input::BlogLanguageDto> for BlogLanguageEntity {
    fn from(value: crate::blog::repository::input::BlogLanguageDto) -> Self {
        match value {
            crate::blog::repository::input::BlogLanguageDto::En => BlogLanguageEntity::En,
            crate::blog::repository::input::BlogLanguageDto::Ja => BlogLanguageEntity::Ja,
        }
    }
}

impl fmt::Display for BlogLanguageEntity {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BlogLanguageEntity::En => write!(f, "en"),
            BlogLanguageEntity::Ja => write!(f, "ja"),
        }
    }
}
