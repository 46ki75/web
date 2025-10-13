use futures::TryStreamExt;
use notionrs::PaginateExt;
use notionrs_types::prelude::*;

fn get_property<'a>(
    properties: &'a std::collections::HashMap<String, PageProperty>,
    property_name: &str,
) -> Result<&'a PageProperty, crate::error::Error> {
    let result =
        properties
            .get(property_name)
            .ok_or(crate::error::Error::NotionPagePropertyNotFound(
                property_name.to_owned(),
            ))?;

    Ok(result)
}

pub trait BlogRepository: Send + Sync {
    fn list_blogs(
        &self,
        language: super::dto::BlogLanguageDto,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<Output = Result<Vec<super::dto::BlogDto>, crate::error::Error>>
                + Send,
        >,
    >;
}

#[derive(Debug)]
pub struct BlogRepositoryImpl {}

impl BlogRepository for BlogRepositoryImpl {
    fn list_blogs(
        &self,
        language: super::dto::BlogLanguageDto,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<Output = Result<Vec<super::dto::BlogDto>, crate::error::Error>>
                + Send,
        >,
    > {
        Box::pin(async move {
            let notionrs_client =
                crate::once_cell_cache::notionrs_client::init_notionrs_client().await?;

            let filter = Filter::status_equals("status", "Published");

            let blog_master_data_source_id = crate::once_cell_cache::ssm_parameter::blog_master_data_source_id::init_blog_master_data_source_id().await?;

            let results: Vec<PageResponse> = notionrs_client
                .query_data_source()
                .data_source_id(blog_master_data_source_id)
                .filter(filter)
                .into_stream()
                .try_collect()
                .await?;

            let mut blogs: Vec<super::dto::BlogDto> = vec![];

            for result in results {
                let page_id = result.id;

                let notion_url = result.url;

                let ogp_image_s3_signed_url = result.cover.map(|cover| cover.get_url());

                // slug # ---------- #
                let maybe_slug = get_property(&result.properties, "slug")?;

                let slug = if let PageProperty::RichText(slug) = maybe_slug {
                    slug.rich_text
                        .iter()
                        .map(|r| r.to_string())
                        .collect::<String>()
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema("slug".to_owned()));
                };

                // featured # ---------- #
                let maybe_featured = get_property(&result.properties, "featured")?;

                let featured = if let PageProperty::Checkbox(featured) = maybe_featured {
                    featured.checkbox
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema(
                        "featured".to_owned(),
                    ));
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
                    return Err(crate::error::Error::NotionInvalidSchema(
                        "tag_ids".to_owned(),
                    ));
                };

                // status # ---------- #
                let maybe_status = get_property(&result.properties, "status")?;

                let status = if let PageProperty::Status(status) = maybe_status {
                    match status.status.name.as_str() {
                        "Draft" => super::dto::BlogStatusDto::Draft,
                        "Archived" => super::dto::BlogStatusDto::Archived,
                        "Private" => super::dto::BlogStatusDto::Private,
                        "Published" => super::dto::BlogStatusDto::Published,
                        _ => super::dto::BlogStatusDto::Draft,
                    }
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema(
                        "status".to_owned(),
                    ));
                };

                // related blog article # ---------- #
                let blog_article_relation_property_name = match language {
                    super::dto::BlogLanguageDto::En => "en",
                    super::dto::BlogLanguageDto::Ja => "ja",
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
                        .ok_or(crate::error::Error::NotionRecord(format!(
                            "relation is not set in property '{0}' (page_id: {1})",
                            blog_article_relation_property_name, page_id
                        )))?;
                    article_page_id
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema(
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
                    return Err(crate::error::Error::NotionInvalidSchema("title".to_owned()));
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
                    return Err(crate::error::Error::NotionInvalidSchema(
                        "description".to_owned(),
                    ));
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
                    return Err(crate::error::Error::NotionInvalidSchema(
                        "keywords".to_owned(),
                    ));
                };

                // // created_at # ---------- #
                let maybe_created_at = get_property(&article_page.properties, "created_at")?;

                let created_at = if let PageProperty::Date(created_at) = maybe_created_at {
                    created_at
                        .date
                        .clone()
                        .and_then(|data| data.start)
                        .map(|start| start.to_string())
                        .ok_or(crate::error::Error::NotionRecord(format!(
                            "start date is not set in property `created_at` (page_id: {0})",
                            article_page.id
                        )))?
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema(
                        "created_at".to_owned(),
                    ));
                };

                // // updated_at # ---------- #
                let maybe_updated_at = get_property(&article_page.properties, "updated_at")?;

                let updated_at = if let PageProperty::Date(updated_at) = maybe_updated_at {
                    updated_at
                        .date
                        .clone()
                        .and_then(|data| data.start)
                        .map(|start| start.to_string())
                        .ok_or(crate::error::Error::NotionRecord(format!(
                            "start date is not set in property `updated_at` (page_id: {0})",
                            article_page.id
                        )))?
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema(
                        "updated_at".to_owned(),
                    ));
                };

                let blog = super::dto::BlogDto {
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
}
