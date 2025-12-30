use core::fmt;
use strum_macros::EnumIter;

#[derive(Debug, Clone)]
pub struct BlogEntity {
    /// Notion page ID
    pub page_id: String,

    /// The URL of the Notion page
    pub notion_url: String,

    /// The URL of the OGP image hosted on S3 by notion
    pub ogp_image_s3_signed_url: Option<String>,

    /// The slug of the blog, which appears as part of the URL
    pub slug: String,

    /// Whether this blog is featured (displayed on the blog home page)
    pub featured: bool,

    /// The IDs of the tags referenced
    pub tag_ids: Vec<String>,

    /// The status of the blog
    pub status: BlogStatusEntity,

    /// The title of the blog
    pub title: String,

    /// The description of the blog
    pub description: String,

    /// The keywords of the blog which are only used for searching
    pub keywords: Vec<String>,

    /// The date and time when the blog was created (ISO 3339)
    pub created_at: String,

    /// The date and time when the blog was updated (ISO 3339)
    pub updated_at: String,
}

impl From<super::dto::BlogDto> for BlogEntity {
    fn from(dto: super::dto::BlogDto) -> Self {
        BlogEntity {
            page_id: dto.page_id,
            notion_url: dto.notion_url,
            ogp_image_s3_signed_url: dto.ogp_image_s3_signed_url,
            slug: dto.slug,
            featured: dto.featured,
            tag_ids: dto.tag_ids,
            status: BlogStatusEntity::from(dto.status),
            title: dto.title,
            description: dto.description,
            keywords: dto.keywords,
            created_at: dto.created_at,
            updated_at: dto.updated_at,
        }
    }
}

#[derive(Debug, Clone)]
pub enum BlogStatusEntity {
    Draft,
    Archived,
    Private,
    Published,
}

impl From<super::dto::BlogStatusDto> for BlogStatusEntity {
    fn from(value: super::dto::BlogStatusDto) -> Self {
        match value {
            super::dto::BlogStatusDto::Draft => BlogStatusEntity::Draft,
            super::dto::BlogStatusDto::Archived => BlogStatusEntity::Archived,
            super::dto::BlogStatusDto::Private => BlogStatusEntity::Private,
            super::dto::BlogStatusDto::Published => BlogStatusEntity::Published,
        }
    }
}

#[derive(Debug, Clone, EnumIter)]
pub enum BlogLanguageEntity {
    En,
    Ja,
}

impl From<super::dto::BlogLanguageDto> for BlogLanguageEntity {
    fn from(value: super::dto::BlogLanguageDto) -> Self {
        match value {
            super::dto::BlogLanguageDto::En => BlogLanguageEntity::En,
            super::dto::BlogLanguageDto::Ja => BlogLanguageEntity::Ja,
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

#[derive(Debug, Clone)]
pub struct BlogContentsEntity {
    pub meta: BlogEntity,
    pub components: Vec<jarkup_rs::Component>,
}

#[derive(Debug, Clone)]
pub struct BlogTagEntity {
    pub id: String,
    pub name_en: String,
    pub name_ja: String,
    pub icon_url: Option<String>,
}

impl From<super::dto::BlogTagDto> for BlogTagEntity {
    fn from(value: super::dto::BlogTagDto) -> Self {
        BlogTagEntity {
            id: value.id,
            name_en: value.name_en,
            name_ja: value.name_ja,
            icon_url: value.icon_url,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename = "urlset")]
pub struct BlogSitemapEntity {
    #[serde(rename = "@xmlns")]
    pub xmlns: String,

    #[serde(rename = "@xmlns:xhtml", skip_serializing_if = "Option::is_none")]
    pub xmlns_xhtml: Option<String>,

    #[serde(rename = "url", default)]
    pub urls: Vec<BlogSitemapUrl>,
}

#[derive(Debug, Clone, serde::Serialize, Default)]
pub struct BlogSitemapUrl {
    pub loc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lastmod: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub changefreq: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub priority: Option<String>,

    #[serde(rename = "xhtml:link", default)]
    pub alternates: Vec<BlogAlternateLink>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct BlogAlternateLink {
    #[serde(rename = "@rel")]
    pub rel: String,

    #[serde(rename = "@hreflang")]
    pub hreflang: String,

    #[serde(rename = "@href")]
    pub href: String,
}

impl Default for BlogSitemapEntity {
    fn default() -> Self {
        BlogSitemapEntity {
            xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9".to_string(),
            xmlns_xhtml: Some("http://www.w3.org/1999/xhtml".to_string()),
            urls: Vec::new(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sitemap_serializes_with_xhtml_namespace() {
        let sitemap = BlogSitemapEntity {
            xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9".into(),
            xmlns_xhtml: Some("http://www.w3.org/1999/xhtml".into()),
            urls: vec![BlogSitemapUrl {
                loc: "https://example.com/".into(),
                alternates: vec![BlogAlternateLink {
                    rel: "alternate".into(),
                    hreflang: "x-default".into(),
                    href: "https://example.com/".into(),
                }],
                ..Default::default()
            }],
        };

        let xml = quick_xml::se::to_string(&sitemap).unwrap();
        println!("sitemap xml: {}", xml);
        assert!(xml.contains(r#"xmlns:xhtml="http://www.w3.org/1999/xhtml""#));
        assert!(xml.contains("xhtml:link"));
    }
}
