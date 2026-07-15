static N2A2UI_CLIENT: tokio::sync::OnceCell<n2a2ui::client::Client> =
    tokio::sync::OnceCell::const_new();

pub async fn init_n2a2ui_client() -> Result<&'static n2a2ui::client::Client, crate::error::Error> {
    N2A2UI_CLIENT
        .get_or_try_init(|| async {
            let stage_name = crate::stage_name()?;
            let notion_api_key =
                crate::once_cell_cache::ssm_parameter::try_get_ssm_parameter_async(format!(
                    "/{stage_name}/46ki75/web/ssm/parameter/notion/secret",
                ))
                .await?;

            let client = n2a2ui::client::Client {
                notionrs_client: notionrs::Client::new(notion_api_key),
                reqwest_client: reqwest::Client::new(),
                enable_unsupported_block: false,
                enable_fetch_image_meta: true,
                enable_fetch_bookmark_meta: false,
                enable_html_embed: false,
            };

            Ok(client)
        })
        .await
}
