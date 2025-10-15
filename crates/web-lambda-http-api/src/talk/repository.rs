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

pub trait TalkRepository: Send + Sync {
    fn list_talks(
        &self,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<Output = Result<Vec<super::dto::TalkDto>, crate::error::Error>>
                + Send,
        >,
    >;
}

#[derive(Debug)]
pub struct TalkRepositoryImpl {}

impl TalkRepository for TalkRepositoryImpl {
    fn list_talks(
        &self,
    ) -> std::pin::Pin<
        Box<
            dyn std::future::Future<Output = Result<Vec<super::dto::TalkDto>, crate::error::Error>>
                + Send,
        >,
    > {
        Box::pin(async move {
            let notionrs_client =
                crate::once_cell_cache::notionrs_client::init_notionrs_client().await?;

            let talks_data_source_id = crate::once_cell_cache::ssm_parameter::talks_data_source_id::init_talks_data_source_id().await?;

            let pages: Vec<PageResponse> = notionrs_client
                .query_data_source()
                .data_source_id(talks_data_source_id)
                .into_stream()
                .try_collect()
                .await?;

            let mut talks: Vec<super::dto::TalkDto> = vec![];

            for page in pages {
                // title
                let maybe_title = get_property(&page.properties, "title")?;

                let title = if let PageProperty::Title(title) = maybe_title {
                    title
                        .title
                        .iter()
                        .map(|r| r.to_string())
                        .collect::<String>()
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema("title".to_owned()));
                };

                // location
                let maybe_location = get_property(&page.properties, "location")?;

                let location = if let PageProperty::RichText(location) = maybe_location {
                    location
                        .rich_text
                        .iter()
                        .map(|r| r.to_string())
                        .collect::<String>()
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema(
                        "location".to_owned(),
                    ));
                };

                // url
                let maybe_url = get_property(&page.properties, "url")?;

                let url = if let PageProperty::Url(url) = maybe_url {
                    url.url.iter().map(|r| r.to_string()).collect::<String>()
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema("url".to_owned()));
                };

                // date
                let maybe_date = get_property(&page.properties, "date")?;

                let date = if let PageProperty::Date(date) = maybe_date {
                    date.date
                        .clone()
                        .and_then(|date| date.start)
                        .map(|start| start.to_string())
                        .ok_or(crate::error::Error::NotionRecord(format!(
                            "start date is not set in property `date` (page_id: {0})",
                            page.id
                        )))?
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema("date".to_owned()));
                };

                let image = page.cover.map(|cover| cover.get_url()).ok_or(
                    crate::error::Error::NotionPagePropertyNotSet {
                        page_id: page.id.clone(),
                        property: "cover".to_owned(),
                    },
                )?;

                let maybe_language = get_property(&page.properties, "language")?;

                let language = if let PageProperty::Select(select) = maybe_language {
                    select
                        .select
                        .clone()
                        .and_then(|select| match select.name.as_str() {
                            "en" => Some(super::dto::TalkLanguageDto::En),
                            "ja" => Some(super::dto::TalkLanguageDto::Ja),
                            _ => None,
                        })
                        .ok_or(crate::error::Error::NotionRecord(format!(
                            "start date is not set in property `language` (page_id: {0})",
                            page.id
                        )))?
                } else {
                    return Err(crate::error::Error::NotionInvalidSchema(
                        "language".to_owned(),
                    ));
                };

                talks.push(crate::talk::dto::TalkDto {
                    title,
                    image,
                    url,
                    location,
                    date,
                    language,
                });
            }

            Ok(talks)
        })
    }
}
