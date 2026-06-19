use tokio::sync::OnceCell;

static S3_CLIENT: OnceCell<aws_sdk_s3::Client> = OnceCell::const_new();

/// Lazily initializes and caches the AWS S3 client for the lifetime of the
/// Lambda execution environment, reusing the shared [`aws_config::SdkConfig`].
pub async fn init_s3_client() -> &'static aws_sdk_s3::Client {
    S3_CLIENT
        .get_or_init(|| async {
            let sdk_config = super::aws_config::init_sdk_config().await;
            aws_sdk_s3::Client::new(sdk_config)
        })
        .await
}
