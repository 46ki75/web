pub struct BlogService {
    pub blog_repository: std::sync::Arc<dyn crate::repository::blog::BlogRepository + Send + Sync>,
}

impl BlogService {
    pub async fn list_blogs(
        &self,
    ) -> Result<Vec<crate::entity::blog::BlogEntity>, crate::error::Error> {
        let blog_records = self.blog_repository.list_blogs().await?;

        let blog_entities = blog_records
            .iter()
            .map(|record| crate::entity::blog::BlogEntity {
                id: record.id.clone(),
                slug: record.slug.clone(),
                title: record.title.clone(),
                description: record.description.clone(),
                tags: record
                    .tags
                    .iter()
                    .map(|tag| crate::entity::blog::BlogTagEntity {
                        id: tag.id.clone(),
                        name: tag.name.clone(),
                        color: match tag.color {
                            crate::record::blog::BlogTagColorRecord::Default => {
                                crate::entity::blog::BlogTagColorEntity::Default
                            }
                            crate::record::blog::BlogTagColorRecord::Blue => {
                                crate::entity::blog::BlogTagColorEntity::Blue
                            }
                            crate::record::blog::BlogTagColorRecord::Brown => {
                                crate::entity::blog::BlogTagColorEntity::Brown
                            }
                            crate::record::blog::BlogTagColorRecord::Gray => {
                                crate::entity::blog::BlogTagColorEntity::Gray
                            }
                            crate::record::blog::BlogTagColorRecord::Green => {
                                crate::entity::blog::BlogTagColorEntity::Green
                            }
                            crate::record::blog::BlogTagColorRecord::Orange => {
                                crate::entity::blog::BlogTagColorEntity::Orange
                            }
                            crate::record::blog::BlogTagColorRecord::Pink => {
                                crate::entity::blog::BlogTagColorEntity::Pink
                            }
                            crate::record::blog::BlogTagColorRecord::Purple => {
                                crate::entity::blog::BlogTagColorEntity::Purple
                            }
                            crate::record::blog::BlogTagColorRecord::Red => {
                                crate::entity::blog::BlogTagColorEntity::Red
                            }
                            crate::record::blog::BlogTagColorRecord::Yellow => {
                                crate::entity::blog::BlogTagColorEntity::Yellow
                            }
                        },
                    })
                    .collect::<Vec<crate::entity::blog::BlogTagEntity>>(),
                status: match record.status {
                    crate::record::blog::BlogStatusRecord::Draft => {
                        crate::entity::blog::BlogStatusEntity::Draft
                    }
                    crate::record::blog::BlogStatusRecord::Published => {
                        crate::entity::blog::BlogStatusEntity::Published
                    }
                    crate::record::blog::BlogStatusRecord::Archived => {
                        crate::entity::blog::BlogStatusEntity::Archived
                    }
                },
                created_at: record.created_at.clone(),
                updated_at: record.updated_at.clone(),
            })
            .collect::<Vec<crate::entity::blog::BlogEntity>>();

        Ok(blog_entities)
    }

    pub async fn get_block_children(&self, page_id: &str) -> Result<String, crate::error::Error> {
        let block_children = self.blog_repository.get_block_children(page_id).await?;

        Ok(block_children)
    }
}
