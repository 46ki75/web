use notionrs_types::prelude::*;

pub async fn get_a2ui_by_slug(
    notionrs_client: notionrs::Client,
    reqwest_client: reqwest::Client,
    blog_master_data_source_id: &str,
    slug: &str,
    language: crate::types::Language,
) -> Result<crate::types::A2uiResult, crate::error::Error> {
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
                    return Err(crate::error::Error::NotionInvalidSchema(
                        property_name.to_owned(),
                    ));
                };

            Ok(article_page_id)
        }
        None => Err(crate::error::Error::NotionRecord("Not Found".to_owned())),
    }?;

    let client = n2a2ui::client::Client {
        notionrs_client,
        reqwest_client,
        enable_unsupported_block: false,
        enable_fetch_image_meta: true,
        enable_fetch_bookmark_meta: false,
        enable_html_embed: false,
    };

    let surface = client.convert_block(&page_id).await?;

    let mut icons_initial: Vec<String> = vec![];
    let mut images_initial: Vec<String> = vec![];
    let mut files_initial: Vec<String> = vec![];

    extract_files(
        &surface,
        &mut icons_initial,
        &mut images_initial,
        &mut files_initial,
    );

    Ok(crate::types::A2uiResult {
        surface,
        icons: icons_initial,
        images: images_initial,
        files: files_initial,
    })
}

fn extract_files(
    surface: &n2a2ui_a2ui::v0_9::Surface,
    icons: &mut Vec<String>,
    images: &mut Vec<String>,
    files: &mut Vec<String>,
) {
    for component in surface.components.values() {
        match component {
            n2a2ui_a2ui::v0_9::Component::Icon(icon) => icons.push(icon.src.clone()),
            n2a2ui_a2ui::v0_9::Component::File(file) => files.push(file.src.clone()),
            n2a2ui_a2ui::v0_9::Component::BlockImage(image) => images.push(image.src.clone()),
            _ => {}
        };
    }
}
