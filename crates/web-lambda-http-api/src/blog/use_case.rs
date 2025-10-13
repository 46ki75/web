#[derive(Clone)]
pub struct BlogUseCase {
    pub blog_repository: std::sync::Arc<dyn super::repository::BlogRepository + Send + Sync>,
}

impl BlogUseCase {
    pub async fn list_blogs(
        &self,
        language: super::entity::BlogLanguageEntity,
    ) -> Result<Vec<super::entity::BlogEntity>, crate::error::Error> {
        let language = match language {
            crate::blog::entity::BlogLanguageEntity::En => super::dto::BlogLanguageDto::En,
            crate::blog::entity::BlogLanguageEntity::Ja => super::dto::BlogLanguageDto::Ja,
        };

        let blog_dtoes = self.blog_repository.list_blogs(language).await?;

        let blog_entities = blog_dtoes
            .into_iter()
            .map(|dto| super::entity::BlogEntity::from(dto))
            .collect::<Vec<super::entity::BlogEntity>>();

        Ok(blog_entities)
    }
}
