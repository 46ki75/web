use tokio::sync::OnceCell;

pub mod blog_master_data_source_id;

static SSM_CLIENT: OnceCell<aws_sdk_ssm::Client> = OnceCell::const_new();

async fn init_ssm_client() -> &'static aws_sdk_ssm::Client {
    SSM_CLIENT
        .get_or_init(|| async {
            let sdk_config = super::aws_config::init_sdk_config().await;

            let ssm_client = aws_sdk_ssm::Client::new(sdk_config);

            ssm_client
        })
        .await
}

pub async fn try_get_ssm_parameter_async(parameter_name: &str) -> anyhow::Result<String> {
    let ssm_client = init_ssm_client().await;

    let parameter = ssm_client
        .get_parameter()
        .name(parameter_name)
        .with_decryption(true)
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Failed to get parameter: {}", e);
            e
        })?
        .parameter
        .ok_or_else(|| {
            tracing::error!("Parameter not found: {}", parameter_name);
            anyhow::anyhow!("Parameter not found: {}", parameter_name)
        })?
        .value
        .ok_or_else(|| {
            tracing::error!("Parameter value not found: {}", parameter_name);
            anyhow::anyhow!("Parameter not found: {}", parameter_name)
        })?;

    tracing::debug!("Fetching SSM Parameter: {}", parameter_name);

    Ok(parameter)
}
