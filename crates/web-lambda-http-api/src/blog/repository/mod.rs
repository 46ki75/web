use futures::TryStreamExt;
use notionrs::PaginateExt;
use notionrs_types::prelude::*;

pub mod input;
pub mod output;

/// Errors produced by the blog repository layer.
///
/// These describe I/O facts — missing Notion properties, broken API connections,
/// image fetch failures — not business outcomes.  Business semantics (e.g. "blog
/// not found") are expressed at the [`crate::blog::use_case`] layer.
#[derive(Debug, thiserror::Error)]
pub enum BlogRepositoryError {
    #[error("property '{0}' not found in Notion page")]
    PagePropertyNotFound(String),

    #[error("property '{0}' has unexpected schema type")]
    InvalidSchema(String),

    #[error("Notion record error: {0}")]
    NotionRecord(String),

    #[error("image fetch error: {0}")]
    FetchImage(#[from] reqwest::Error),

    #[error("Notion API error: {0}")]
    NotionApi(#[from] notionrs::Error),

    #[error("Notion block conversion error: {0}")]
    BlockConversion(#[from] n2a2ui::error::Error),

    /// Wraps shared infrastructure failures (SSM, environment variables) that
    /// have no additional business meaning at this layer.
    #[error(transparent)]
    Internal(#[from] crate::error::Error),
}

fn get_property<'a>(
    properties: &'a std::collections::HashMap<String, PageProperty>,
    property_name: &str,
) -> Result<&'a PageProperty, BlogRepositoryError> {
    properties
        .get(property_name)
        .ok_or_else(|| BlogRepositoryError::PagePropertyNotFound(property_name.to_owned()))
}

pub trait BlogRepository: Send + Sync {
    fn list_blogs(
        &self,
        language: input::BlogLanguageDto,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<Output = Result<Vec<output::BlogDto>, BlogRepositoryError>>
                + Send,
        >,
    >;

    fn get_blog_contents(
        &self,
        slug: &str,
        language: input::BlogLanguageDto,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<
                    Output = Result<n2a2ui_a2ui::v0_9::Surface, BlogRepositoryError>,
                > + Send,
        >,
    >;

    fn list_tags(
        &self,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<Output = Result<Vec<output::BlogTagDto>, BlogRepositoryError>>
                + Send,
        >,
    >;

    fn fetch_image_by_url(
        &self,
        url: &str,
    ) -> std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<bytes::Bytes, BlogRepositoryError>> + Send>,
    >;

    fn fetch_image_by_block_id(
        &self,
        block_id: &str,
    ) -> std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<bytes::Bytes, BlogRepositoryError>> + Send>,
    >;
}

#[derive(Debug)]
pub struct BlogRepositoryImpl {}

impl BlogRepository for BlogRepositoryImpl {
    #[cfg_attr(not(rust_analyzer), tracing::instrument(skip(self), err))]
    fn list_blogs(
        &self,
        language: input::BlogLanguageDto,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<Output = Result<Vec<output::BlogDto>, BlogRepositoryError>>
                + Send,
        >,
    > {
        Box::pin(async move {
            let notionrs_client =
                crate::once_cell_cache::notionrs_client::init_notionrs_client().await?;

            let filter = Filter::status_equals("status", "Published");

            let stage_name = crate::stage_name()?;
            let blog_master_data_source_id =
                crate::once_cell_cache::ssm_parameter::try_get_ssm_parameter_async(format!(
                "/{stage_name}/46ki75/web/ssm/parameter/notion/data_source/id/blog-article-master"
            ))
                .await?;

            let results: Vec<PageResponse> = notionrs_client
                .query_data_source()
                .data_source_id(blog_master_data_source_id)
                .filter(filter)
                .into_stream()
                .try_collect()
                .await?;

            let mut blogs: Vec<output::BlogDto> = vec![];

            for result in results {
                let page_id = result.id;

                let notion_url = result.url;

                // slug # ---------- #
                let maybe_slug = get_property(&result.properties, "slug")?;

                let slug = if let PageProperty::RichText(slug) = maybe_slug {
                    slug.rich_text
                        .iter()
                        .map(|r| r.to_string())
                        .collect::<String>()
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("slug".to_owned()));
                };

                // featured # ---------- #
                let maybe_featured = get_property(&result.properties, "featured")?;

                let featured = if let PageProperty::Checkbox(featured) = maybe_featured {
                    featured.checkbox
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("featured".to_owned()));
                };

                // tag_ids # ---------- #
                let maybe_tag_ids = get_property(&result.properties, "tag_ids")?;

                let tag_ids = if let PageProperty::Relation(tag_ids) = maybe_tag_ids {
                    tag_ids
                        .relation
                        .iter()
                        .map(|r| r.id.clone())
                        .collect::<Vec<String>>()
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("tag_ids".to_owned()));
                };

                // status # ---------- #
                let maybe_status = get_property(&result.properties, "status")?;

                let status = if let PageProperty::Status(status) = maybe_status {
                    match status.status.name.as_str() {
                        "Draft" => output::BlogStatusDto::Draft,
                        "Archived" => output::BlogStatusDto::Archived,
                        "Private" => output::BlogStatusDto::Private,
                        "Published" => output::BlogStatusDto::Published,
                        _ => output::BlogStatusDto::Draft,
                    }
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("status".to_owned()));
                };

                // related blog article # ---------- #
                let blog_article_relation_property_name = match language {
                    input::BlogLanguageDto::En => "en",
                    input::BlogLanguageDto::Ja => "ja",
                };

                let maybe_blog_article_relation = get_property(
                    &result.properties,
                    &format!("article_{blog_article_relation_property_name}",),
                )?;

                let article_page_id = if let PageProperty::Relation(blog_article_relation) =
                    maybe_blog_article_relation
                {
                    let article_page_id = blog_article_relation
                        .relation
                        .first()
                        .map(|relation| relation.id.clone())
                        .ok_or_else(|| {
                            BlogRepositoryError::NotionRecord(format!(
                                "relation is not set in property '{0}' (page_id: {1})",
                                blog_article_relation_property_name, page_id
                            ))
                        })?;
                    article_page_id
                } else {
                    return Err(BlogRepositoryError::InvalidSchema(
                        blog_article_relation_property_name.to_owned(),
                    ));
                };

                let article_page = notionrs_client
                    .get_page()
                    .page_id(article_page_id)
                    .send()
                    .await?;

                // // title # ---------- #
                let maybe_title = get_property(&article_page.properties, "title")?;

                let title = if let PageProperty::Title(title) = maybe_title {
                    title
                        .title
                        .iter()
                        .map(|r| r.to_string())
                        .collect::<String>()
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("title".to_owned()));
                };

                // // description # ---------- #
                let maybe_description = get_property(&article_page.properties, "description")?;

                let description = if let PageProperty::RichText(description) = maybe_description {
                    description
                        .rich_text
                        .iter()
                        .map(|r| r.to_string())
                        .collect::<String>()
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("description".to_owned()));
                };

                // // keywords # ---------- #
                let maybe_keywords = get_property(&article_page.properties, "keywords")?;

                let keywords = if let PageProperty::RichText(keywords) = maybe_keywords {
                    keywords
                        .rich_text
                        .iter()
                        .map(|r| r.to_string())
                        .collect::<String>()
                        .split(",")
                        .map(|k| k.trim().to_owned())
                        .collect::<Vec<String>>()
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("keywords".to_owned()));
                };

                // // created_at # ---------- #
                let maybe_created_at = get_property(&article_page.properties, "created_at")?;

                let created_at = if let PageProperty::Date(created_at) = maybe_created_at {
                    created_at
                        .date
                        .clone()
                        .and_then(|data| data.start)
                        .map(|start| match start {
                            DateOrDateTime::Date(date) => {
                                time::UtcDateTime::new(date, time::Time::from_hms(0, 0, 0).unwrap())
                                    .to_offset(time::macros::offset!(+0))
                            }
                            DateOrDateTime::DateTime(offset_date_time) => offset_date_time,
                        })
                        .ok_or_else(|| {
                            BlogRepositoryError::NotionRecord(format!(
                                "start date is not set in property `created_at` (page_id: {0})",
                                article_page.id
                            ))
                        })?
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("created_at".to_owned()));
                };

                // // updated_at # ---------- #
                let maybe_updated_at = get_property(&article_page.properties, "updated_at")?;

                let updated_at = if let PageProperty::Date(updated_at) = maybe_updated_at {
                    updated_at
                        .date
                        .clone()
                        .and_then(|data| data.start)
                        .map(|start| match start {
                            DateOrDateTime::Date(date) => {
                                time::UtcDateTime::new(date, time::Time::from_hms(0, 0, 0).unwrap())
                                    .to_offset(time::macros::offset!(+0))
                            }
                            DateOrDateTime::DateTime(offset_date_time) => offset_date_time,
                        })
                        .ok_or_else(|| {
                            BlogRepositoryError::NotionRecord(format!(
                                "start date is not set in property `updated_at` (page_id: {0})",
                                article_page.id
                            ))
                        })?
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("updated_at".to_owned()));
                };

                let ogp_image_s3_signed_url = article_page.cover.map(|cover| cover.get_url());

                let blog = output::BlogDto {
                    page_id,
                    notion_url,
                    ogp_image_s3_signed_url,
                    slug,
                    featured,
                    tag_ids,
                    status,
                    title,
                    description,
                    keywords,
                    created_at,
                    updated_at,
                };

                blogs.push(blog);
            }

            Ok(blogs)
        })
    }

    #[cfg_attr(not(rust_analyzer), tracing::instrument(skip(self), err))]
    fn get_blog_contents(
        &self,
        slug: &str,
        language: input::BlogLanguageDto,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<
                    Output = Result<n2a2ui_a2ui::v0_9::Surface, BlogRepositoryError>,
                > + Send,
        >,
    > {
        let slug = slug.to_owned();
        let language = language;

        Box::pin(async move {
            let notionrs_client =
                crate::once_cell_cache::notionrs_client::init_notionrs_client().await?;

            let stage_name = crate::stage_name()?;
            let blog_master_data_source_id =
                crate::once_cell_cache::ssm_parameter::try_get_ssm_parameter_async(format!(
                "/{stage_name}/46ki75/web/ssm/parameter/notion/data_source/id/blog-article-master"
            ))
                .await?;

            let filter = Filter::rich_text_equals("slug", &slug);

            let pages: Vec<PageResponse<std::collections::HashMap<String, PageProperty>>> =
                notionrs_client
                    .query_data_source()
                    .data_source_id(blog_master_data_source_id)
                    .filter(filter)
                    .send()
                    .await?
                    .results;

            let page_id = match pages.first() {
                Some(page) => {
                    let property_name = match language {
                        input::BlogLanguageDto::En => "article_en",
                        input::BlogLanguageDto::Ja => "article_ja",
                    };

                    let maybe_relation = get_property(&page.properties, property_name)?;

                    let article_page_id = if let PageProperty::Relation(blog_article_relation) =
                        maybe_relation
                    {
                        let article_page_id = blog_article_relation
                            .relation
                            .first()
                            .map(|relation| relation.id.clone())
                            .ok_or_else(|| {
                                BlogRepositoryError::NotionRecord(format!(
                                    "relation is not set in property '{0}' (page_id: {1})",
                                    property_name, page.id
                                ))
                            })?;
                        article_page_id
                    } else {
                        return Err(BlogRepositoryError::InvalidSchema(property_name.to_owned()));
                    };

                    Ok(article_page_id)
                }
                None => Err(BlogRepositoryError::NotionRecord("Not Found".to_owned())),
            }?;

            let client = crate::once_cell_cache::n2a2ui_client::init_n2a2ui_client().await?;

            Ok(client.convert_block(&page_id).await?)
        })
    }

    #[cfg_attr(not(rust_analyzer), tracing::instrument(skip(self), err))]
    fn list_tags(
        &self,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<Output = Result<Vec<output::BlogTagDto>, BlogRepositoryError>>
                + Send,
        >,
    > {
        Box::pin(async move {
            let notionrs_client =
                crate::once_cell_cache::notionrs_client::init_notionrs_client().await?;

            let stage_name = crate::stage_name()?;
            let blog_tag_data_source_id =
                crate::once_cell_cache::ssm_parameter::try_get_ssm_parameter_async(format!(
                    "/{stage_name}/46ki75/web/ssm/parameter/notion/data_source/id/blog-tag"
                ))
                .await?;

            let pages: Vec<PageResponse> = notionrs_client
                .query_data_source()
                .data_source_id(blog_tag_data_source_id)
                .into_stream()
                .try_collect()
                .await?;

            let mut tags: Vec<output::BlogTagDto> = vec![];

            for page in pages {
                // name_en # ---------- #
                let maybe_name_en = get_property(&page.properties, "name_en")?;

                let name_en = if let PageProperty::RichText(name_en) = maybe_name_en {
                    name_en
                        .rich_text
                        .iter()
                        .map(|r| r.to_string())
                        .collect::<String>()
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("name_en".to_owned()));
                };

                // name_ja # ---------- #
                let maybe_name_ja = get_property(&page.properties, "name_ja")?;

                let name_ja = if let PageProperty::RichText(name_ja) = maybe_name_ja {
                    name_ja
                        .rich_text
                        .iter()
                        .map(|r| r.to_string())
                        .collect::<String>()
                } else {
                    return Err(BlogRepositoryError::InvalidSchema("name_ja".to_owned()));
                };

                let icon_url = page.icon.and_then(|icon| match icon {
                    EmojiAndIcon::File(file) => Some(file.get_url()),
                    EmojiAndIcon::CustomEmoji(custom_emoji) => Some(custom_emoji.custom_emoji.url),
                    _ => None,
                });

                let tag = output::BlogTagDto {
                    id: page.id,
                    name_en,
                    name_ja,
                    icon_url,
                };

                tags.push(tag);
            }

            Ok(tags)
        })
    }

    #[cfg_attr(not(rust_analyzer), tracing::instrument(skip(self), err))]
    fn fetch_image_by_url(
        &self,
        url: &str,
    ) -> std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<bytes::Bytes, BlogRepositoryError>> + Send>,
    > {
        let url = url.to_owned();

        Box::pin(async move {
            let response = reqwest::get(url).await?;
            let bytes = response.bytes().await?;
            Ok(bytes)
        })
    }

    #[cfg_attr(not(rust_analyzer), tracing::instrument(skip(self), err))]
    fn fetch_image_by_block_id(
        &self,
        block_id: &str,
    ) -> std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<bytes::Bytes, BlogRepositoryError>> + Send>,
    > {
        let block_id = block_id.to_owned();

        Box::pin(async move {
            let notionrs_client =
                crate::once_cell_cache::notionrs_client::init_notionrs_client().await?;

            let request = notionrs_client.get_block().block_id(block_id);

            let response = request.send().await?;

            let url = match response.block {
                notionrs_types::object::block::Block::Image { image } => image.get_url(),
                _ => {
                    return Err(BlogRepositoryError::InvalidSchema(
                        "The requested block is not an Image block.".to_string(),
                    ));
                }
            };

            let response = reqwest::get(url).await?;
            let bytes = response.bytes().await?;
            Ok(bytes)
        })
    }
}
