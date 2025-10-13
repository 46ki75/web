use tokio::sync::OnceCell;

static BLOG_TAG_DATA_SOURCE_ID: OnceCell<String> = OnceCell::const_new();

pub async fn init_blog_tag_data_source_id() -> Result<&'static String, crate::error::Error> {
    BLOG_TAG_DATA_SOURCE_ID
        .get_or_try_init(|| async {
            let parameter = super::try_get_ssm_parameter_async(
                "/dev/46ki75/web/ssm/parameter/notion/data_source/id/blog-tag",
            )
            .await?;

            Ok(parameter)
        })
        .await
}
