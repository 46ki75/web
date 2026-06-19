use tokio::sync::OnceCell;

static CLOUDFRONT_CLIENT: OnceCell<aws_sdk_cloudfront::Client> = OnceCell::const_new();

/// Lazily initializes and caches the AWS CloudFront client for the lifetime of
/// the Lambda execution environment, reusing the shared [`aws_config::SdkConfig`].
///
/// CloudFront is a global service, so the client targets its global endpoint
/// regardless of the configured region.
pub async fn init_cloudfront_client() -> &'static aws_sdk_cloudfront::Client {
    CLOUDFRONT_CLIENT
        .get_or_init(|| async {
            let sdk_config = super::aws_config::init_sdk_config().await;
            aws_sdk_cloudfront::Client::new(sdk_config)
        })
        .await
}
