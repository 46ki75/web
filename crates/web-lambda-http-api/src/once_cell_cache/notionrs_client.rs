static NOTIONRS_CLIENT: tokio::sync::OnceCell<notionrs::Client> =
    tokio::sync::OnceCell::const_new();

pub async fn init_notionrs_client() -> Result<&'static notionrs::Client, crate::error::Error> {
    NOTIONRS_CLIENT
        .get_or_try_init(|| async {
            let stage_name = crate::stage_name()?;
            let notion_api_key =
                crate::once_cell_cache::ssm_parameter::try_get_ssm_parameter_async(format!(
                    "/{stage_name}/46ki75/web/ssm/parameter/notion/secret",
                ))
                .await?;

            let client = notionrs::Client::new(notion_api_key.as_str());

            Ok(client)
        })
        .await
}
