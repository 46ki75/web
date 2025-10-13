static NOTION_TO_JARKUP_CLIENT: tokio::sync::OnceCell<notion_to_jarkup::client::Client> =
    tokio::sync::OnceCell::const_new();

pub async fn init_notion_to_jarkup_client(
) -> Result<&'static notion_to_jarkup::client::Client, crate::error::Error> {
    NOTION_TO_JARKUP_CLIENT
        .get_or_try_init(|| async {
            let notion_api_key =
                super::ssm_parameter::notion_api_key::init_notion_api_key().await?;

            let notion_to_jarkup_client = notion_to_jarkup::client::Client {
                notionrs_client: notionrs::Client::new(notion_api_key),
                reqwest_client: reqwest::Client::new(),
                enable_unsupported_block: false,
            };

            Ok(notion_to_jarkup_client)
        })
        .await
}
