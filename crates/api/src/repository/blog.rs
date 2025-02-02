use notionrs::page::page_response;

#[async_trait::async_trait]
pub trait BlogRepository {
    async fn list_blogs(
        sort: crate::model::blog::SortDirection,
    ) -> Result<
        notionrs::list_response::ListResponse<notionrs::page::PageResponse>,
        crate::error::Error,
    >;

    async fn get_blog_by_slug(
        slug: u64,
    ) -> Result<notionrs::page::PageResponse, crate::error::Error>;
}

pub struct BlogRepositoryImpl;

#[async_trait::async_trait]
impl BlogRepository for BlogRepositoryImpl {
    async fn list_blogs(
        sort: crate::model::blog::SortDirection,
    ) -> Result<
        notionrs::list_response::ListResponse<notionrs::page::PageResponse>,
        crate::error::Error,
    > {
        let notion_token = std::env::var("NOTION_API_KEY")?;
        let database_id = std::env::var("NOTION_BLOG_DATABASE_ID")?;

        let client = notionrs::Client::new().secret(notion_token);

        let status_filter = notionrs::filter::Filter::status_equals("status", "published");

        let sort = match sort {
            crate::model::blog::SortDirection::Asc => {
                notionrs::database::sort::Sort::asc("createdAt")
            }
            crate::model::blog::SortDirection::Desc => {
                notionrs::database::sort::Sort::desc("createdAt")
            }
        };

        let request = client
            .query_database()
            .database_id(database_id)
            .filter(status_filter)
            .sorts(vec![sort]);

        let response = request.send().await?;

        Ok(response)

        // let blogs = response
        //     .results
        //     .iter()
        //     .map(|blog| {
        //         let slug = blog
        //             .properties
        //             .get("slug")
        //             .ok_or(crate::error::Error::AttributeNotFound(
        //                 "slug not found".to_string(),
        //             ))?
        //             .to_string();

        //         let title = blog
        //             .properties
        //             .get("title")
        //             .ok_or(crate::error::Error::AttributeNotFound(
        //                 "title not found".to_string(),
        //             ))?
        //             .to_string();

        //         let description = blog
        //             .properties
        //             .get("description")
        //             .ok_or(crate::error::Error::AttributeNotFound(
        //                 "description not found".to_string(),
        //             ))?
        //             .to_string();

        //         let ogp_image = blog
        //             .properties
        //             .get("ogpImage")
        //             .map(|value| value.to_string());

        //         let created_at = blog
        //             .properties
        //             .get("createdAt")
        //             .ok_or(crate::error::Error::AttributeNotFound(
        //                 "created_at not found".to_string(),
        //             ))?
        //             .to_string();

        //         let updated_at = blog
        //             .properties
        //             .get("updatedAt")
        //             .ok_or(crate::error::Error::AttributeNotFound(
        //                 "updated_at not found".to_string(),
        //             ))?
        //             .to_string();

        //         let tags = blog
        //             .properties
        //             .get("tags")
        //             .map(|value| match &value {
        //                 notionrs::page::PageProperty::MultiSelect(tags) => tags
        //                     .multi_select
        //                     .iter()
        //                     .map(|tag| {
        //                         let id = tag.id.clone().ok_or_else(|| {
        //                             crate::error::Error::AttributeNotFound(
        //                                 "tag id not found".to_string(),
        //                             )
        //                         })?;

        //                         let color = tag.color.ok_or_else(|| {
        //                             crate::error::Error::AttributeNotFound(
        //                                 "tag color not found".to_string(),
        //                             )
        //                         })?;

        //                         let color_string = color.to_string();

        //                         Ok(crate::model::blog::Tag {
        //                             id,
        //                             name: tag.name.to_string(),
        //                             color: color_string,
        //                         })
        //                     })
        //                     .collect::<Result<Vec<crate::model::blog::Tag>, crate::error::Error>>(),
        //                 _ => Err(crate::error::Error::AttributeNotFound(
        //                     "tags not found".to_string(),
        //                 )),
        //             })
        //             .unwrap_or_else(|| Ok(vec![]))?;

        //         Ok(crate::model::blog::Blog {
        //             id: blog.id.clone(),
        //             slug,
        //             title,
        //             description,
        //             ogp_image,
        //             created_at,
        //             updated_at,
        //             tags,
        //         })
        //     })
        //     .collect::<Result<Vec<crate::model::blog::Blog>, crate::error::Error>>()?;
    }

    async fn get_blog_by_slug(
        slug: u64,
    ) -> Result<notionrs::page::PageResponse, crate::error::Error> {
        let notion_token = std::env::var("NOTION_API_KEY")?;
        let database_id = std::env::var("NOTION_BLOG_DATABASE_ID")?;

        let client = notionrs::Client::new().secret(notion_token);

        let slug_filter = notionrs::filter::Filter::unique_id_equals("slug", slug);
        let status_filter = notionrs::filter::Filter::status_equals("status", "published");
        let filter = notionrs::filter::Filter::and(vec![slug_filter, status_filter]);

        let request = client
            .query_database()
            .database_id(database_id)
            .filter(filter);

        let response = request.send().await?;

        let page_response = response
            .results
            .first()
            .ok_or(crate::error::Error::AttributeNotFound(
                "Blog not found".to_string(),
            ))?
            .clone();

        Ok(page_response)

        // let blog = response
        //     .results
        //     .first()
        //     .ok_or(crate::error::Error::AttributeNotFound(
        //         "Blog not found".to_string(),
        //     ))?;

        // let title = blog
        //     .properties
        //     .get("title")
        //     .ok_or(crate::error::Error::AttributeNotFound(
        //         "title not found".to_string(),
        //     ))?
        //     .to_string();

        // let description = blog
        //     .properties
        //     .get("description")
        //     .ok_or(crate::error::Error::AttributeNotFound(
        //         "description not found".to_string(),
        //     ))?
        //     .to_string();

        // let ogp_image = blog
        //     .properties
        //     .get("ogp_image")
        //     .map(|value| value.to_string());

        // let created_at = blog
        //     .properties
        //     .get("createdAt")
        //     .ok_or(crate::error::Error::AttributeNotFound(
        //         "created_at not found".to_string(),
        //     ))?
        //     .to_string();

        // let updated_at = blog
        //     .properties
        //     .get("updatedAt")
        //     .ok_or(crate::error::Error::AttributeNotFound(
        //         "updated_at not found".to_string(),
        //     ))?
        //     .to_string();

        // let tags = blog
        //     .properties
        //     .get("tags")
        //     .map(|value| match &value {
        //         notionrs::page::PageProperty::MultiSelect(tags) => tags
        //             .multi_select
        //             .iter()
        //             .map(|tag| {
        //                 let id = tag.id.clone().ok_or_else(|| {
        //                     crate::error::Error::AttributeNotFound("tag id not found".to_string())
        //                 })?;

        //                 let color = tag.color.ok_or_else(|| {
        //                     crate::error::Error::AttributeNotFound(
        //                         "tag color not found".to_string(),
        //                     )
        //                 })?;

        //                 let color_string = color.to_string();

        //                 Ok(crate::model::blog::Tag {
        //                     id,
        //                     name: tag.name.to_string(),
        //                     color: color_string,
        //                 })
        //             })
        //             .collect::<Result<Vec<crate::model::blog::Tag>, crate::error::Error>>(),
        //         _ => Err(crate::error::Error::AttributeNotFound(
        //             "tags not found".to_string(),
        //         )),
        //     })
        //     .unwrap_or_else(|| Ok(vec![]))?;

        // Ok(crate::model::blog::Blog {
        //     id: blog.id.clone(),
        //     slug: slug.to_string(),
        //     title,
        //     description,
        //     ogp_image,
        //     created_at,
        //     updated_at,
        //     tags,
        // })
    }
}

pub struct BlogRepositoryStab;

#[async_trait::async_trait]
impl BlogRepository for BlogRepositoryStab {
    async fn list_blogs(
        _sort: crate::model::blog::SortDirection,
    ) -> Result<
        notionrs::list_response::ListResponse<notionrs::page::PageResponse>,
        crate::error::Error,
    > {
        Ok(notionrs::list_response::ListResponse {
            object: "page".to_string(),
            results: vec![],
            next_cursor: None,
            has_more: Some(false),
            r#type: Some("list".to_string()),
        })
    }

    async fn get_blog_by_slug(
        slug: u64,
    ) -> Result<notionrs::page::PageResponse, crate::error::Error> {
        Ok(page_response::PageResponse {
            id: "91fa985b-ee83-4e20-a17e-d965a5beebe8".to_string(),
            created_time: chrono::DateTime::parse_from_rfc3339("2021-01-01T00:00:00Z").unwrap(),
            last_edited_time: chrono::DateTime::parse_from_rfc3339("2021-01-01T00:00:00Z").unwrap(),
            created_by: notionrs::user::User::Person(notionrs::Person {
                object: "user".to_string(),
                id: "user_id".to_string(),
                name: Some("user_name".to_string()),
                avatar_url: Some("https://example.com/avatar.png".to_string()),
                r#type: Some("person".to_string()),
                person: Some(notionrs::PersonDetail {
                    email: Some("user@example.com".to_string()),
                }),
            }),
            last_edited_by: notionrs::user::User::Person(notionrs::Person {
                object: "user".to_string(),
                id: "user_id".to_string(),
                name: Some("user_name".to_string()),
                avatar_url: Some("https://example.com/avatar.png".to_string()),
                r#type: Some("person".to_string()),
                person: Some(notionrs::PersonDetail {
                    email: Some("user@example.com".to_string()),
                }),
            }),
            cover: None,
            icon: None,
            parent: notionrs::others::parent::Parent::DatabaseParent(
                notionrs::others::parent::DatabaseParent::default(),
            ),
            archived: false,
            properties: std::collections::HashMap::new(),
            url: "https://example.com".to_string(),
            public_url: None,
            developer_survey: None,
            request_id: None,
            in_trash: false,
        })
    }
}
