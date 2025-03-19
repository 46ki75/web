pub struct BlogEntity {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub tags: Vec<BlogTagEntity>,
    pub status: BlogStatusEntity,
    pub created_at: String,
    pub updated_at: String,
}

pub struct BlogTagEntity {
    pub id: String,
    pub name: String,
    pub color: BlogTagColorEntity,
}

#[derive(Debug, Default)]
pub enum BlogTagColorEntity {
    #[default]
    Default,
    Blue,
    Brown,
    Gray,
    Green,
    Orange,
    Pink,
    Purple,
    Red,
    Yellow,
}

#[derive(Debug, Default)]
pub enum BlogStatusEntity {
    #[default]
    Draft,
    Published,
    Archived,
}
