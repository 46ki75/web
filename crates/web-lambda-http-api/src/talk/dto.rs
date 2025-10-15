#[derive(Debug, Clone)]
pub struct TalkDto {
    pub id: String,
    pub title: String,
    pub image: String,
    pub url: String,
    pub location: String,
    pub date: String,
    pub language: TalkLanguageDto,
}

#[derive(Debug, Clone)]
pub enum TalkLanguageDto {
    En,
    Ja,
}
