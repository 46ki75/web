pub struct BlogRecord {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub tags: Vec<BlogTagRecord>,
    pub status: BlogStatusRecord,
    pub created_at: String,
    pub updated_at: String,
}

pub struct BlogTagRecord {
    pub id: String,
    pub name: String,
    pub color: BlogTagColorRecord,
}

#[derive(Debug, Default)]
pub enum BlogTagColorRecord {
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
pub enum BlogStatusRecord {
    #[default]
    Draft,
    Published,
    Archived,
}
