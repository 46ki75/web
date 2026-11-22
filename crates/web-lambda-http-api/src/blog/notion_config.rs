use std::ffi::OsString;

const TOKEN: &str = "NOTION_TOKEN";
const ARTICLES: &str = "NOTION_ARTICLE_DATA_SOURCE_ID";
const TAGS: &str = "NOTION_TAG_DATA_SOURCE_ID";

/// Provider-independent Notion credentials and content source IDs.
/// Intentionally does not implement `Debug` to keep the token out of logs.
pub struct NotionConfig {
    pub(super) token: String,
    pub(super) article_data_source_id: String,
    pub(super) tag_data_source_id: String,
}

#[derive(Debug, thiserror::Error)]
pub enum NotionConfigError {
    #[error("Notion is not configured: set NOTION_TOKEN, NOTION_ARTICLE_DATA_SOURCE_ID, and NOTION_TAG_DATA_SOURCE_ID")]
    NotConfigured,

    #[error("missing or invalid Notion setting '{0}'")]
    InvalidSetting(&'static str),
}

impl NotionConfig {
    pub fn new(
        token: String,
        article_data_source_id: String,
        tag_data_source_id: String,
    ) -> Result<Self, NotionConfigError> {
        // notionrs panics if the supplied token cannot be used in an HTTP header.
        if token.trim().is_empty() || reqwest::header::HeaderValue::from_str(&token).is_err() {
            return Err(NotionConfigError::InvalidSetting(TOKEN));
        }
        if article_data_source_id.trim().is_empty() {
            return Err(NotionConfigError::InvalidSetting(ARTICLES));
        }
        if tag_data_source_id.trim().is_empty() {
            return Err(NotionConfigError::InvalidSetting(TAGS));
        }
        Ok(Self {
            token,
            article_data_source_id,
            tag_data_source_id,
        })
    }

    pub fn from_env() -> Result<Self, NotionConfigError> {
        Self::from_lookup(std::env::var_os)
    }

    fn from_lookup(
        lookup: impl Fn(&'static str) -> Option<OsString>,
    ) -> Result<Self, NotionConfigError> {
        let [token, articles, tags] = [TOKEN, ARTICLES, TAGS].map(lookup);
        if token.is_none() && articles.is_none() && tags.is_none() {
            return Err(NotionConfigError::NotConfigured);
        }

        let string = |value: Option<OsString>, name| {
            value
                .and_then(|raw| raw.into_string().ok())
                .ok_or(NotionConfigError::InvalidSetting(name))
        };
        Self::new(
            string(token, TOKEN)?,
            string(articles, ARTICLES)?,
            string(tags, TAGS)?,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_notions_settings_from_the_environment_contract() -> Result<(), NotionConfigError> {
        let config = NotionConfig::from_lookup(|name| match name {
            TOKEN => Some("test-token".into()),
            ARTICLES => Some("articles".into()),
            TAGS => Some("tags".into()),
            _ => None,
        })?;
        assert_eq!(config.token, "test-token");
        assert_eq!(config.article_data_source_id, "articles");
        assert_eq!(config.tag_data_source_id, "tags");
        Ok(())
    }

    #[test]
    fn distinguishes_absent_configuration_from_partial_configuration() {
        assert!(matches!(
            NotionConfig::from_lookup(|_| None),
            Err(NotionConfigError::NotConfigured)
        ));
        let result = NotionConfig::from_lookup(|name| (name == TOKEN).then(|| "test-token".into()));
        assert!(matches!(
            result,
            Err(NotionConfigError::InvalidSetting(ARTICLES))
        ));
    }

    #[test]
    fn validates_credentials_without_including_token_in_errors() {
        let result = NotionConfig::new("test-token\n".into(), "articles".into(), "tags".into());
        assert!(matches!(
            result,
            Err(NotionConfigError::InvalidSetting(TOKEN))
        ));
        let result = NotionConfig::new("test-token".into(), "articles".into(), "   ".into());
        assert!(matches!(
            result,
            Err(NotionConfigError::InvalidSetting(TAGS))
        ));
    }
}
