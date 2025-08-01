#[derive(Default)]
pub struct TalkQueryResolver {}

#[derive(async_graphql::SimpleObject)]
#[non_exhaustive]
pub struct Talk {
    pub url: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub lang: Option<TalkLanguage>,
    pub image: Option<String>,
    pub date: String,

    pub location: TalkLocation,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, async_graphql::Enum)]
#[non_exhaustive]
pub enum TalkLanguage {
    En,
    Ja,
}

#[derive(Debug, async_graphql::SimpleObject)]
#[non_exhaustive]
pub struct TalkLocation {
    en: String,
    ja: String,
}

#[async_graphql::Object]
impl TalkQueryResolver {
    pub async fn talk(
        &self,
        ctx: &async_graphql::Context<'_>,
        owner: String,
        repo: String,
    ) -> Result<Talk, async_graphql::Error> {
        let service = ctx.data::<crate::service::talk::TalkService>()?;

        let talk_entity = service.fetch_slidev(&owner, &repo).await?;

        let talk = Talk {
            url: talk_entity.url,
            title: talk_entity.title,
            description: talk_entity.description,
            lang: talk_entity.language.map(|language| match language {
                crate::entity::talk::TalkEntityLanguage::En => TalkLanguage::En,
                crate::entity::talk::TalkEntityLanguage::Ja => TalkLanguage::En,
            }),
            image: talk_entity.image,
            date: talk_entity.date,
            location: TalkLocation {
                en: talk_entity.location_en,
                ja: talk_entity.location_ja,
            },
        };

        Ok(talk)
    }
}
