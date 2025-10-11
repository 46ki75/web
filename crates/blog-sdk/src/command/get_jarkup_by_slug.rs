use notionrs_types::prelude::*;

pub async fn get_jarkup_by_slug(
    notionrs_client: notionrs::Client,
    reqwest_client: reqwest::Client,
    blog_master_data_source_id: &str,
    slug: &str,
    language: crate::types::Language,
) -> Result<Vec<jarkup_rs::Component>, crate::error::Error> {
    let filter = Filter::rich_text_equals("slug", slug);

    let pages: Vec<PageResponse<std::collections::HashMap<String, PageProperty>>> = notionrs_client
        .query_data_source()
        .data_source_id(blog_master_data_source_id)
        .filter(filter)
        .send()
        .await?
        .results;

    let page_id = match pages.first() {
        Some(page) => {
            let property_name = match language {
                crate::types::Language::En => "article_en",
                crate::types::Language::Ja => "article_ja",
            };

            let maybe_relation = crate::util::get_property(&page.properties, property_name)?;

            let article_page_id =
                if let PageProperty::Relation(blog_article_relation) = maybe_relation {
                    let article_page_id = blog_article_relation
                        .relation
                        .first()
                        .map(|relation| relation.id.clone())
                        .ok_or(crate::error::Error::NotionRecord(format!(
                            "relation is not set in property '{0}' (page_id: {1})",
                            property_name, page.id
                        )))?;
                    article_page_id
                } else {
                    return Err(crate::error::Error::NotionPagePropertySchema(
                        property_name.to_owned(),
                    ));
                };

            Ok(article_page_id)
        }
        None => Err(crate::error::Error::NotionRecord("Not Found".to_owned())),
    }?;

    let client = notion_to_jarkup::client::Client {
        notionrs_client,
        reqwest_client,
        enable_unsupported_block: false,
    };

    let page = client.convert_block(&page_id).await?;

    Ok(page)
}
