#[derive(Debug)]
pub struct BlogUseCase<T>
where
    T: Send + Sync + super::repository::BlogRepository,
{
    pub blog_repository: T,
}

impl<T> BlogUseCase<T>
where
    T: Send + Sync + super::repository::BlogRepository,
{
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
