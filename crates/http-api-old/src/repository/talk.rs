//! TalkRepository module
#![deny(missing_docs)]

/// Repository for fetching slide data from GitHub Pages.
#[async_trait::async_trait]
pub trait TalkRepository {
    /// Fetches HTML content from a SliDev presentation hosted on GitHub Pages.
    async fn fetch_slidev_html(
        &self,
        owner: &str,
        repo: &str,
    ) -> Result<String, crate::error::Error>;

    /// Fetches metadata (`talk-metadata.json`) from a SliDev presentation hosted on GitHub Pages.
    async fn fetch_slidev_metadata(
        &self,
        owner: &str,
        repo: &str,
    ) -> Result<String, crate::error::Error>;
}

/// Implementation of `TalkRepository` trait.
pub struct TalkRepositoryImpl {}

#[async_trait::async_trait]
impl TalkRepository for TalkRepositoryImpl {
    async fn fetch_slidev_html(
        &self,
        owner: &str,
        repo: &str,
    ) -> Result<String, crate::error::Error> {
        let url = format!("https://{owner}.github.io/{repo}");

        let client = reqwest::Client::new();

        let html = client
            .get(url)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("{}", e.to_string());
                crate::error::Error::ReqwestHttp(e.to_string())
            })?
            .text()
            .await
            .map_err(|e| {
                tracing::error!("{}", e.to_string());
                crate::error::Error::ReqwestHttpResponseBodyStream(e.to_string())
            })?;

        Ok(html)
    }

    async fn fetch_slidev_metadata(
        &self,
        owner: &str,
        repo: &str,
    ) -> Result<String, crate::error::Error> {
        let url = format!("https://{owner}.github.io/{repo}/talk-metadata.json");

        let client = reqwest::Client::new();

        let metadata = client
            .get(url)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("{}", e.to_string());
                crate::error::Error::ReqwestHttp(e.to_string())
            })?
            .text()
            .await
            .map_err(|e| {
                tracing::error!("{}", e.to_string());
                crate::error::Error::ReqwestHttpResponseBodyStream(e.to_string())
            })?;

        Ok(metadata)
    }
}

/// Stub of `TalkRepository` trait.
pub struct TalkRepositoryStub {}

#[async_trait::async_trait]
impl TalkRepository for TalkRepositoryStub {
    async fn fetch_slidev_html(
        &self,
        _owner: &str,
        _repo: &str,
    ) -> Result<String, crate::error::Error> {
        Ok(
            r#"
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>How specifically do you design Amazon DynamoDB? - Slidev</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Avenir+Next:wght@200;400;600&family=Nunito+Sans:wght@200;400;600&family=Fira+Code:wght@200;400;600&display=swap" type="text/css">
            <link rel="icon" href="https://cdn.jsdelivr.net/gh/slidevjs/slidev/assets/favicon.png">
            <meta property="slidev:version" content="52.0.0">
            <meta name="description" content="&quot;Amazon DynamoDB is a NoSQL DBMS... This is a well-known fact, but understanding how data is actually stored and how indexes are created requires a considerable amount of time. In this LT (Lightning Talk), I've summarized the necessary knowledge for a jump-start on such understanding in 5 minutes.&quot;">
            <meta property="og:title" content="How specifically do you design Amazon DynamoDB? - Slidev">
            <meta property="og:description" content="&quot;Amazon DynamoDB is a NoSQL DBMS... This is a well-known fact, but understanding how data is actually stored and how indexes are created requires a considerable amount of time. In this LT (Lightning Talk), I've summarized the necessary knowledge for a jump-start on such understanding in 5 minutes.&quot;">
            <meta property="og:image" content="https://46ki75.github.io/lt-aws-dynamodb-arch/ogp.webp">
            <meta property="twitter:card" content="summary_large_image">
            <meta property="twitter:image" content="https://46ki75.github.io/lt-aws-dynamodb-arch/ogp.webp">  <script type="module" crossorigin src="/lt-aws-dynamodb-arch/assets/index-CJUDUmum.js"></script>
            <link rel="modulepreload" crossorigin href="/lt-aws-dynamodb-arch/assets/modules/vue-Bh4OUlnP.js">
            <link rel="modulepreload" crossorigin href="/lt-aws-dynamodb-arch/assets/modules/shiki-CyxH9Fca.js">
            <link rel="stylesheet" crossorigin href="/lt-aws-dynamodb-arch/assets/modules/shiki-CozCpemh.css">
            <link rel="stylesheet" crossorigin href="/lt-aws-dynamodb-arch/assets/index-BtHZUHMw.css">
            </head>
            <body>
            <div id="app"></div>
            <div id="mermaid-rendering-container"></div>
            </body>
            </html>
        "#.to_owned(),
        )
    }

    async fn fetch_slidev_metadata(
        &self,
        _owner: &str,
        _repo: &str,
    ) -> Result<String, crate::error::Error> {
        Ok(r#"
            {
                "location": {
                    "en": "Amazon Japan Meguro Central Square 21F",
                    "ja": "Amazon Japan 目黒セントラルスクエア 21F"
                },
                "date": "2025-07-25"
            }
        "#
        .to_owned())
    }
}
