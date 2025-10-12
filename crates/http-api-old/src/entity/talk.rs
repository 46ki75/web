//! Talk record returned by the `TalkService`.

/// Talk record returned by the `TalkService`.
pub struct TalkEntity {
    /// Language in which the presentation was given.
    pub language: Option<TalkEntityLanguage>,

    /// Slides URL
    pub url: String,

    /// Title of the presentation.
    pub title: Option<String>,

    /// Description of the presentation
    pub description: Option<String>,

    /// URL oft the OGP Image
    pub image: Option<String>,

    /// Location where the presentation were given. (English)
    pub location_en: String,

    /// Location where the presentation were given. (Japanese)
    pub location_ja: String,

    /// Date when the presentation was given. (Format: `YYYY-MM-DD`)
    pub date: String,
}

#[allow(missing_docs)]
pub enum TalkEntityLanguage {
    En,
    Ja,
}
