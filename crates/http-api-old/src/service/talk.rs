//! Service that invokes repository methods and executes business logic.

/// Service that invokes repository methods and executes business logic.
pub struct TalkService {
    /// Instance of `TalkService`. Injected at the entry point.
    pub talk_repository: std::sync::Arc<dyn crate::repository::talk::TalkRepository + Send + Sync>,
}

impl TalkService {
    /// Fetches SliDev metadata by repository owner and name.
    pub async fn fetch_slidev(
        &self,
        owner: &str,
        repo: &str,
    ) -> Result<crate::entity::talk::TalkEntity, crate::error::Error> {
        let metadata = self
            .talk_repository
            .fetch_slidev_metadata(owner, repo)
            .await?;

        #[derive(serde::Deserialize)]
        struct TalkMetadata {
            location: TalkMetadataLocation,
            date: String,
        }

        #[derive(serde::Deserialize)]
        struct TalkMetadataLocation {
            en: String,
            ja: String,
        }

        let metadata = serde_json::from_str::<TalkMetadata>(&metadata).map_err(|e| {
            tracing::error!("Failed to serialize talk-metadata.json: {}", e.to_string());
            crate::error::Error::Deserialization(e.to_string())
        })?;

        let html = self.talk_repository.fetch_slidev_html(owner, repo).await?;

        let scraper = html_meta_scraper::MetaScraper::new(&html);

        let url = format!("https://{owner}.github.io/{repo}");

        let title = scraper.title();

        let description = scraper.description();

        let image = scraper.image();

        let language = scraper.lang();

        let talk = crate::entity::talk::TalkEntity {
            language: language.and_then(|l| match l.as_str() {
                "en" => Some(crate::entity::talk::TalkEntityLanguage::En),
                "ja" => Some(crate::entity::talk::TalkEntityLanguage::Ja),
                _ => None,
            }),
            url,
            title,
            description,
            image,
            location_en: metadata.location.en,
            location_ja: metadata.location.ja,
            date: metadata.date,
        };

        Ok(talk)
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    #[tokio::test]
    async fn test_fetch_slidev() -> Result<(), crate::error::Error> {
        let talk_service = TalkService {
            talk_repository: std::sync::Arc::new(crate::repository::talk::TalkRepositoryStub {}),
        };

        let _ = talk_service.fetch_slidev("46ki75", "my-repo").await?;

        Ok(())
    }
}
