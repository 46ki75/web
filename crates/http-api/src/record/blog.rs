pub struct BlogRecord {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub ogp_image_s3_url: Option<String>,
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

impl TryFrom<notionrs::object::select::Select> for BlogTagRecord {
    type Error = crate::error::Error;

    fn try_from(tag: notionrs::object::select::Select) -> Result<Self, Self::Error> {
        let id = tag.id.ok_or_else(|| {
            tracing::error!("Notion database invalid schema: Tags.id");
            crate::error::Error::NotionDatabaseInvalidSchema("Tags.id".to_string())
        })?;

        let name = tag.name;

        let select_color = tag.color.ok_or_else(|| {
            tracing::error!("Notion database invalid schema: Tags.color");
            crate::error::Error::NotionDatabaseInvalidSchema("Tags.color".to_string())
        })?;

        let color = match select_color {
            notionrs::object::select::SelectColor::Blue => {
                crate::record::blog::BlogTagColorRecord::Blue
            }
            notionrs::object::select::SelectColor::Default => {
                crate::record::blog::BlogTagColorRecord::Default
            }
            notionrs::object::select::SelectColor::Brown => {
                crate::record::blog::BlogTagColorRecord::Brown
            }
            notionrs::object::select::SelectColor::Gray => {
                crate::record::blog::BlogTagColorRecord::Gray
            }
            notionrs::object::select::SelectColor::Green => {
                crate::record::blog::BlogTagColorRecord::Green
            }
            notionrs::object::select::SelectColor::Orange => {
                crate::record::blog::BlogTagColorRecord::Orange
            }
            notionrs::object::select::SelectColor::Pink => {
                crate::record::blog::BlogTagColorRecord::Pink
            }
            notionrs::object::select::SelectColor::Purple => {
                crate::record::blog::BlogTagColorRecord::Purple
            }
            notionrs::object::select::SelectColor::Red => {
                crate::record::blog::BlogTagColorRecord::Red
            }
            notionrs::object::select::SelectColor::Yellow => {
                crate::record::blog::BlogTagColorRecord::Yellow
            }
        };

        Ok(crate::record::blog::BlogTagRecord { id, name, color })
    }
}

impl TryFrom<notionrs::object::page::PageResponse> for BlogRecord {
    type Error = crate::error::Error;

    fn try_from(value: notionrs::object::page::PageResponse) -> Result<Self, Self::Error> {
        let page = value;

        let id = page.id;

        let properties = page.properties;

        let title = properties
            .get("Title")
            .ok_or_else(|| {
                tracing::error!("Notion database property not found: Title");
                crate::error::Error::NotionDatabasePropertyNotFound("Title".to_string())
            })?
            .to_string();

        let slug = properties
            .get("Slug")
            .ok_or_else(|| {
                tracing::error!("Notion database property not found: Slug");
                crate::error::Error::NotionDatabasePropertyNotFound("Slug".to_string())
            })?
            .to_string();

        let description = properties
            .get("Description")
            .ok_or_else(|| {
                tracing::error!("Notion database property not found: Description");
                crate::error::Error::NotionDatabasePropertyNotFound("Description".to_string())
            })?
            .to_string();

        let ogp_image_s3_url = properties
            .get("OGPImage")
            .map(|ogp_image| ogp_image.to_string());

        let tags = match properties.get("Tags").ok_or_else(|| {
            tracing::error!("Notion database property not found: Tags");
            crate::error::Error::NotionDatabasePropertyNotFound("Tags".to_string())
        })? {
            notionrs::object::page::PageProperty::MultiSelect(multi_select) => multi_select
                .clone()
                .multi_select
                .into_iter()
                .map(BlogTagRecord::try_from)
                .collect::<Result<Vec<crate::record::blog::BlogTagRecord>, crate::error::Error>>(),
            _ => {
                tracing::error!("Notion database invalid schema: Tags");
                return Err(crate::error::Error::NotionDatabaseInvalidSchema(
                    "Tags".to_string(),
                ));
            }
        }?;

        let status = match properties
            .get("Status")
            .ok_or_else(|| {
                tracing::error!("Notion database property not found: Status");
                crate::error::Error::NotionDatabasePropertyNotFound("Status".to_string())
            })?
            .to_string()
            .as_str()
        {
            "Draft" => crate::record::blog::BlogStatusRecord::Draft,
            "Published" => crate::record::blog::BlogStatusRecord::Published,
            "Archived" => crate::record::blog::BlogStatusRecord::Archived,
            _ => {
                tracing::error!("Notion database invalid schema: Status");
                return Err(crate::error::Error::NotionDatabaseInvalidSchema(
                    "Status: Valid variants: Draft, Published, Archived".to_string(),
                ));
            }
        };

        let created_at = properties
            .get("CreatedAt")
            .ok_or_else(|| {
                tracing::error!("Notion database property not found: Description");
                crate::error::Error::NotionDatabasePropertyNotFound("CreatedAt".to_string())
            })?
            .to_string();

        let updated_at = properties
            .get("UpdatedAt")
            .ok_or_else(|| {
                tracing::error!("Notion database property not found: Description");
                crate::error::Error::NotionDatabasePropertyNotFound("CreatedAt".to_string())
            })?
            .to_string();

        Ok(BlogRecord {
            id,
            slug,
            title,
            description,
            ogp_image_s3_url,
            tags,
            status,
            created_at,
            updated_at,
        })
    }
}
