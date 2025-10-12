use tokio::sync::OnceCell;

static BLOG_MASTER_DATA_SOURCE_ID: OnceCell<String> = OnceCell::const_new();

pub async fn init_blog_master_data_source_id() -> Result<&'static String, crate::error::Error> {
    BLOG_MASTER_DATA_SOURCE_ID
        .get_or_try_init(|| async {
            let parameter = super::try_get_ssm_parameter_async("parameter_name").await?;

            Ok(parameter)
        })
        .await
}
