#[derive(Clone)]
pub struct TalkUseCase {
    pub talk_repository: std::sync::Arc<dyn super::repository::TalkRepository + Send + Sync>,
}

impl TalkUseCase {
    pub async fn list_talks(&self) -> Result<Vec<super::entity::TalkEntity>, crate::error::Error> {
        let talk_dtoes = self.talk_repository.list_talks().await?;

        let talk_entites = talk_dtoes
            .into_iter()
            .map(|talk| talk.into())
            .collect::<Vec<super::entity::TalkEntity>>();

        Ok(talk_entites)
    }
}
