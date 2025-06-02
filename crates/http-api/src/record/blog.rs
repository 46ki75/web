#![deny(missing_docs)]
//! Blog record returned by the `BlogRepository`.

/// Blog record returned by the `BlogRepository`.
pub struct BlogRecord {
    /// Unique identifier of the blog.
    pub id: String,

    /// Slug of the blog. (Currently unused)
    pub slug: String,

    /// Title of the blog.
    pub title: String,

    /// Description of the blog.
    pub description: String,

    /// URL of the OGP image. The signed URL expires in 1 hour.
    pub ogp_image_s3_url: Option<String>,

    /// Tags associated with the blog.
    pub tags: Vec<BlogTagRecord>,

    /// Status of the blog. Only `Published` blogs are returned.
    pub status: BlogStatusRecord,

    /// Keywords of the blog. Used to improve article searchability.
    pub keywords: String,

    /// RFC 3339-formatted creation timestamp.
    pub created_at: String,

    /// RFC 3339-formatted last update timestamp.
    pub updated_at: String,

    /// Notion Page URL
    pub url: String,
}

/// Blog tag record returned by `BlogRepository`.
pub struct BlogTagRecord {
    /// Unique identifier of the blog tag.
    pub id: String,

    /// Name of the blog tag.
    pub name: String,

    /// Color of the blog tag.
    pub color: BlogTagColorRecord,
}

/// Color opstions for a blog tag.
#[allow(missing_docs)]
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

/// Status options for a blog.
#[derive(Debug, Default)]
pub enum BlogStatusRecord {
    #[default]
    /// Work in progress; not ready to be published.
    Draft,
    /// Published and visible on the internet.
    Published,
    /// Written but unpublished for some reason.
    Archived,
}

impl TryFrom<notionrs_types::object::select::Select> for BlogTagRecord {
    type Error = crate::error::Error;

    fn try_from(tag: notionrs_types::object::select::Select) -> Result<Self, Self::Error> {
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
            notionrs_types::object::select::SelectColor::Blue => {
                crate::record::blog::BlogTagColorRecord::Blue
            }
            notionrs_types::object::select::SelectColor::Default => {
                crate::record::blog::BlogTagColorRecord::Default
            }
            notionrs_types::object::select::SelectColor::Brown => {
                crate::record::blog::BlogTagColorRecord::Brown
            }
            notionrs_types::object::select::SelectColor::Gray => {
                crate::record::blog::BlogTagColorRecord::Gray
            }
            notionrs_types::object::select::SelectColor::Green => {
                crate::record::blog::BlogTagColorRecord::Green
            }
            notionrs_types::object::select::SelectColor::Orange => {
                crate::record::blog::BlogTagColorRecord::Orange
            }
            notionrs_types::object::select::SelectColor::Pink => {
                crate::record::blog::BlogTagColorRecord::Pink
            }
            notionrs_types::object::select::SelectColor::Purple => {
                crate::record::blog::BlogTagColorRecord::Purple
            }
            notionrs_types::object::select::SelectColor::Red => {
                crate::record::blog::BlogTagColorRecord::Red
            }
            notionrs_types::object::select::SelectColor::Yellow => {
                crate::record::blog::BlogTagColorRecord::Yellow
            }
        };

        Ok(crate::record::blog::BlogTagRecord { id, name, color })
    }
}

impl TryFrom<notionrs_types::object::page::PageResponse> for BlogRecord {
    type Error = crate::error::Error;

    fn try_from(value: notionrs_types::object::page::PageResponse) -> Result<Self, Self::Error> {
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
            .map(|ogp_image| ogp_image.to_string())
            .and_then(|ogp_image| {
                if ogp_image.is_empty() {
                    None
                } else {
                    Some(ogp_image)
                }
            });

        let tags = match properties.get("Tags").ok_or_else(|| {
            tracing::error!("Notion database property not found: Tags");
            crate::error::Error::NotionDatabasePropertyNotFound("Tags".to_string())
        })? {
            notionrs_types::object::page::PageProperty::MultiSelect(multi_select) => multi_select
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

        let keywords = properties
            .get("Keywords")
            .ok_or_else(|| {
                tracing::error!("Notion database property not found: Keywords");
                crate::error::Error::NotionDatabasePropertyNotFound("Keywords".to_string())
            })?
            .to_string();

        let created_at = properties
            .get("CreatedAt")
            .ok_or_else(|| {
                tracing::error!("Notion database property not found: CreatedAt");
                crate::error::Error::NotionDatabasePropertyNotFound("CreatedAt".to_string())
            })?
            .to_string();

        let updated_at = properties
            .get("UpdatedAt")
            .ok_or_else(|| {
                tracing::error!("Notion database property not found: UpdatedAt");
                crate::error::Error::NotionDatabasePropertyNotFound("UpdatedAt".to_string())
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
            keywords,
            created_at,
            updated_at,
            url: page.url,
        })
    }
}
