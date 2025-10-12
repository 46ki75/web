use futures::TryStreamExt;
use notionrs::PaginateExt;
use notionrs_types::prelude::*;

pub async fn list_tags(
    notion_api_key: &str,
    blog_tag_data_source_id: &str,
) -> Result<Vec<crate::types::Tag>, crate::error::Error> {
    let notionrs_client = notionrs::Client::new(notion_api_key);

    let pages: Vec<PageResponse> = notionrs_client
        .query_data_source()
        .data_source_id(blog_tag_data_source_id)
        .into_stream()
        .try_collect()
        .await?;

    let mut tags: Vec<crate::types::Tag> = vec![];

    for page in pages {
        // name_en # ---------- #
        let maybe_name_en = crate::util::get_property(&page.properties, "name_en")?;

        let name_en = if let PageProperty::RichText(name_en) = maybe_name_en {
            name_en
                .rich_text
                .iter()
                .map(|r| r.to_string())
                .collect::<String>()
        } else {
            return Err(crate::error::Error::NotionInvalidSchema(
                "name_en".to_owned(),
            ));
        };

        // name_ja # ---------- #
        let maybe_name_ja = crate::util::get_property(&page.properties, "name_ja")?;

        let name_ja = if let PageProperty::RichText(name_ja) = maybe_name_ja {
            name_ja
                .rich_text
                .iter()
                .map(|r| r.to_string())
                .collect::<String>()
        } else {
            return Err(crate::error::Error::NotionInvalidSchema(
                "name_ja".to_owned(),
            ));
        };

        let icon_url = page.icon.and_then(|icon| match icon {
            Icon::File(file) => Some(file.get_url()),
            Icon::CustomEmoji(custom_emoji) => Some(custom_emoji.custom_emoji.url),
            _ => None,
        });

        let tag = crate::types::Tag {
            id: page.id,
            name_en,
            name_ja,
            icon_url,
        };

        tags.push(tag);
    }

    Ok(tags)
}
