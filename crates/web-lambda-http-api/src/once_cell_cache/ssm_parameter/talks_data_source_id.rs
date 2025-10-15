use tokio::sync::OnceCell;

static TALKS_DATA_SOURCE_ID: OnceCell<String> = OnceCell::const_new();

pub async fn init_talks_data_source_id() -> Result<&'static String, crate::error::Error> {
    TALKS_DATA_SOURCE_ID
        .get_or_try_init(|| async {
            let stage_name = crate::stage_name()?;

            let parameter = super::try_get_ssm_parameter_async(&format!(
                "/{stage_name}/46ki75/web/ssm/parameter/notion/data_source/id/talks",
            ))
            .await?;

            Ok(parameter)
        })
        .await
}
