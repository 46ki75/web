use notionrs_types::prelude::*;

pub async fn get_jarkup_by_slug(
    notionrs_client: notionrs::Client,
    reqwest_client: reqwest::Client,
    blog_master_data_source_id: &str,
    slug: &str,
    language: crate::types::Language,
) -> Result<crate::types::JarkupResult, crate::error::Error> {
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

    let client = notion_to_jarkup::client::Client {
        notionrs_client,
        reqwest_client,
        enable_unsupported_block: false,
    };

    let components = client.convert_block(&page_id).await?;

    let mut icons_initial: Vec<String> = vec![];
    let mut images_initial: Vec<String> = vec![];
    let mut files_initial: Vec<String> = vec![];

    extract_files(
        &components,
        &mut icons_initial,
        &mut images_initial,
        &mut files_initial,
    )?;

    Ok(crate::types::JarkupResult {
        components,
        icons: icons_initial,
        images: images_initial,
        files: files_initial,
    })
}

fn extract_files(
    components: &Vec<jarkup_rs::Component>,
    icons: &mut Vec<String>,
    images: &mut Vec<String>,
    files: &mut Vec<String>,
) -> Result<(), crate::error::Error> {
    for component in components {
        match component {
            jarkup_rs::Component::InlineComponent(inline_component) => {
                if let jarkup_rs::InlineComponent::Icon(icon) = inline_component {
                    icons.push(icon.props.src.clone());
                }
            }
            jarkup_rs::Component::BlockComponent(block_component) => match block_component {
                jarkup_rs::BlockComponent::File(file) => {
                    files.push(file.props.src.clone());
                }
                jarkup_rs::BlockComponent::Image(image) => {
                    images.push(image.props.src.clone());
                }
                jarkup_rs::BlockComponent::Heading(heading) => {
                    extract_from_inline_components(&heading.slots.default, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::Paragraph(paragraph) => {
                    extract_from_inline_components(&paragraph.slots.default, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::ListItem(list_item) => {
                    extract_files(&list_item.slots.default, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::List(list) => {
                    extract_files(&list.slots.default, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::BlockQuote(block_quote) => {
                    extract_files(&block_quote.slots.default, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::Callout(callout) => {
                    extract_files(&callout.slots.default, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::Divider(_divider) => {}
                jarkup_rs::BlockComponent::Toggle(toggle) => {
                    extract_files(&toggle.slots.default, icons, images, files)?;
                    extract_from_inline_components(&toggle.slots.summary, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::Bookmark(_bookmark) => {}
                jarkup_rs::BlockComponent::CodeBlock(code_block) => {
                    if let Some(slots) = &code_block.slots {
                        extract_from_inline_components(&slots.default, icons, images, files)?;
                    }
                }
                jarkup_rs::BlockComponent::Katex(_katex) => {}
                jarkup_rs::BlockComponent::Mermaid(_mermaid) => {}
                jarkup_rs::BlockComponent::Table(table) => {
                    if let Some(header) = &table.slots.header {
                        extract_files(header, icons, images, files)?;
                    }
                    extract_files(&table.slots.body, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::TableRow(table_row) => {
                    extract_files(&table_row.slots.default, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::TableCell(table_cell) => {
                    extract_from_inline_components(
                        &table_cell.slots.default,
                        icons,
                        images,
                        files,
                    )?;
                }
                jarkup_rs::BlockComponent::ColumnList(column_list) => {
                    extract_files(&column_list.slots.default, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::Column(column) => {
                    extract_files(&column.slots.default, icons, images, files)?;
                }
                jarkup_rs::BlockComponent::Unsupported(_unsupported) => {}
            },
        };
    }

    Ok(())
}

fn extract_from_inline_components(
    inline_components: &[jarkup_rs::InlineComponent],
    icons: &mut Vec<String>,
    _images: &mut Vec<String>,
    _files: &mut Vec<String>,
) -> Result<(), crate::error::Error> {
    for inline in inline_components {
        if let jarkup_rs::InlineComponent::Icon(icon) = inline {
            icons.push(icon.props.src.clone());
        }
    }
    Ok(())
}
