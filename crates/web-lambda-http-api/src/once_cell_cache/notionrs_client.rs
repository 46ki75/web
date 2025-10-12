use anyhow::Ok;

static NOTIONRS_CLIENT: tokio::sync::OnceCell<notionrs::Client> =
    tokio::sync::OnceCell::const_new();

pub async fn init_notionrs_client() -> anyhow::Result<&'static notionrs::Client> {
    NOTIONRS_CLIENT
        .get_or_try_init(|| async {
            let secret = std::env::var("NOTION_API_KEY").map_err(|error| {
                tracing::error!(
                    "Failed to load environmental variable: {0}",
                    "NOTION_API_KEY"
                );
                error
            })?;

            let client = notionrs::Client::new(secret.as_str());

            Ok(client)
        })
        .await
}
