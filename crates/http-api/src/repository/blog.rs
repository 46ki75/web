#[async_trait::async_trait]
pub trait BlogRepository {
    async fn list_blogs(&self)
    -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error>;

    async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error>;
}

pub struct BlogRepositoryImpl {
    pub config: crate::config::Config,
}

#[async_trait::async_trait]
impl BlogRepository for BlogRepositoryImpl {
    async fn list_blogs(
        &self,
    ) -> Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error> {
        let filter =
            notionrs::object::request::filter::Filter::status_equals("Status", "Published");

        let request = self
            .config
            .notionrs_client
            .query_database_all()
            .filter(filter)
            .database_id(&self.config.notion_blog_database_id);

        let response = request.send().await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        let blogs = response
            .into_iter()
            .map(|blog| {
                let id = blog.id;

                let properties = blog.properties;

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
                        crate::error::Error::NotionDatabasePropertyNotFound(
                            "Description".to_string(),
                        )
                    })?
                    .to_string();

                let tags =
                        match properties.get("Tags").ok_or_else(|| {
                            tracing::error!("Notion database property not found: Tags");
                            crate::error::Error::NotionDatabasePropertyNotFound("Tags".to_string())
                        })? {
                            notionrs::object::page::PageProperty::MultiSelect(multi_select) => {
                                multi_select
                                    .clone()
                                    .multi_select
                                    .into_iter()
                                    .map(|tag| {
                                        let id = tag.id.ok_or_else(|| {
                                            tracing::error!(
                                                "Notion database invalid schema: Tags.id"
                                            );
                                            crate::error::Error::NotionDatabaseInvalidSchema(
                                                "Tags.id".to_string(),
                                            )
                                        })?;

                                        let name = tag.name;

                                        let select_color = tag.color.ok_or_else(|| {
                                            tracing::error!(
                                                "Notion database invalid schema: Tags.color"
                                            );
                                            crate::error::Error::NotionDatabaseInvalidSchema(
                                                "Tags.color".to_string(),
                                            )
                                        })?;

                                        let color = match select_color {
                                            notionrs::object::select::SelectColor::Blue => {
                                                crate::record::blog::BlogTagColorRecord::Blue
                                            }
                                            notionrs::object::select::SelectColor::Default => {
                                                crate::record::blog::BlogTagColorRecord::Default
                                            }
                                            notionrs::object::select::SelectColor::Brown => {
                                                crate::record::blog::BlogTagColorRecord::Brown
                                            }
                                            notionrs::object::select::SelectColor::Gray => {
                                                crate::record::blog::BlogTagColorRecord::Gray
                                            }
                                            notionrs::object::select::SelectColor::Green => {
                                                crate::record::blog::BlogTagColorRecord::Green
                                            }
                                            notionrs::object::select::SelectColor::Orange => {
                                                crate::record::blog::BlogTagColorRecord::Orange
                                            }
                                            notionrs::object::select::SelectColor::Pink => {
                                                crate::record::blog::BlogTagColorRecord::Pink
                                            }
                                            notionrs::object::select::SelectColor::Purple => {
                                                crate::record::blog::BlogTagColorRecord::Purple
                                            }
                                            notionrs::object::select::SelectColor::Red => {
                                                crate::record::blog::BlogTagColorRecord::Red
                                            }
                                            notionrs::object::select::SelectColor::Yellow => {
                                                crate::record::blog::BlogTagColorRecord::Yellow
                                            }
                                        };

                                        Ok(crate::record::blog::BlogTagRecord { id, name, color })
                                    })
                                    .collect::<Result<
                                        Vec<crate::record::blog::BlogTagRecord>,
                                        crate::error::Error,
                                    >>()
                            }
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

                let created_at = properties
                    .get("CreatedAt")
                    .ok_or_else(|| {
                        tracing::error!("Notion database property not found: Description");
                        crate::error::Error::NotionDatabasePropertyNotFound("CreatedAt".to_string())
                    })?
                    .to_string();

                let updated_at = properties
                    .get("CreatedAt")
                    .ok_or_else(|| {
                        tracing::error!("Notion database property not found: Description");
                        crate::error::Error::NotionDatabasePropertyNotFound("CreatedAt".to_string())
                    })?
                    .to_string();

                Ok(crate::record::blog::BlogRecord {
                    id,
                    slug,
                    title,
                    description,
                    tags,
                    status,
                    created_at,
                    updated_at,
                })
            })
            .collect::<Result<Vec<crate::record::blog::BlogRecord>, crate::error::Error>>()?;

        Ok(blogs)
    }

    async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error> {
        let mut client = elmethis_notion::client::Client::new(&self.config.notion_api_key);

        let response = client.convert_block(page_id).await.map_err(|e| {
            tracing::error!("An error occurred while invoke Notion API: {}", e);
            crate::error::Error::NotionAPI(e.to_string())
        })?;

        Ok(serde_json::to_string(&response).map_err(|e| {
            tracing::error!("An error occurred while serialize response: {}", e);
            crate::error::Error::Serialization(e.to_string())
        })?)
    }
}
