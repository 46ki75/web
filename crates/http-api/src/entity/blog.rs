pub struct BlogEntity {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub ogp_image_s3_url: Option<String>,
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

impl From<crate::record::blog::BlogTagRecord> for BlogTagEntity {
    fn from(value: crate::record::blog::BlogTagRecord) -> Self {
        let record = value;

        crate::entity::blog::BlogTagEntity {
            id: record.id.clone(),
            name: record.name.clone(),
            color: match record.color {
                crate::record::blog::BlogTagColorRecord::Default => {
                    crate::entity::blog::BlogTagColorEntity::Default
                }
                crate::record::blog::BlogTagColorRecord::Blue => {
                    crate::entity::blog::BlogTagColorEntity::Blue
                }
                crate::record::blog::BlogTagColorRecord::Brown => {
                    crate::entity::blog::BlogTagColorEntity::Brown
                }
                crate::record::blog::BlogTagColorRecord::Gray => {
                    crate::entity::blog::BlogTagColorEntity::Gray
                }
                crate::record::blog::BlogTagColorRecord::Green => {
                    crate::entity::blog::BlogTagColorEntity::Green
                }
                crate::record::blog::BlogTagColorRecord::Orange => {
                    crate::entity::blog::BlogTagColorEntity::Orange
                }
                crate::record::blog::BlogTagColorRecord::Pink => {
                    crate::entity::blog::BlogTagColorEntity::Pink
                }
                crate::record::blog::BlogTagColorRecord::Purple => {
                    crate::entity::blog::BlogTagColorEntity::Purple
                }
                crate::record::blog::BlogTagColorRecord::Red => {
                    crate::entity::blog::BlogTagColorEntity::Red
                }
                crate::record::blog::BlogTagColorRecord::Yellow => {
                    crate::entity::blog::BlogTagColorEntity::Yellow
                }
            },
        }
    }
}

impl From<crate::record::blog::BlogRecord> for BlogEntity {
    fn from(value: crate::record::blog::BlogRecord) -> Self {
        let record = value;

        crate::entity::blog::BlogEntity {
            id: record.id.clone(),
            slug: record.slug.clone(),
            title: record.title.clone(),
            description: record.description.clone(),
            ogp_image_s3_url: record.ogp_image_s3_url.clone(),
            tags: record
                .tags
                .into_iter()
                .map(BlogTagEntity::from)
                .collect::<Vec<crate::entity::blog::BlogTagEntity>>(),
            status: match record.status {
                crate::record::blog::BlogStatusRecord::Draft => {
                    crate::entity::blog::BlogStatusEntity::Draft
                }
                crate::record::blog::BlogStatusRecord::Published => {
                    crate::entity::blog::BlogStatusEntity::Published
                }
                crate::record::blog::BlogStatusRecord::Archived => {
                    crate::entity::blog::BlogStatusEntity::Archived
                }
            },
            created_at: record.created_at.clone(),
            updated_at: record.updated_at.clone(),
        }
    }
}
