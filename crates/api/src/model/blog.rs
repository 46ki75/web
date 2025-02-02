pub struct Blog {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub ogp_image: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub tags: Vec<Tag>,
}

#[derive(Clone)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
}

#[derive(Copy, Clone, Eq, PartialEq, Default)]
pub enum SortDirection {
    Asc,
    #[default]
    Desc,
}
