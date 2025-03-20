#[derive(Debug, Clone)]
pub struct Config {
    pub stage_name: String,

    pub ssm_client: std::sync::Arc<aws_sdk_ssm::Client>,

    pub notion_api_key: String,
    pub notion_blog_database_id: String,

    pub notionrs_client: std::sync::Arc<notionrs::client::Client>,
    pub elmethis_notion_client: std::sync::Arc<elmethis_notion::client::Client>,
}

impl Config {
    pub async fn try_new_async() -> Result<Self, crate::error::Error> {
        let stage_name = Self::try_get_stage_name_async().await?;

        let aws_sdk_config = Self::try_get_aws_sdk_config_async().await?;

        let ssm_client = Self::try_get_ssm_client_async(&aws_sdk_config).await?;

        let notion_api_key =
            Self::try_get_notion_api_key_async(ssm_client.clone(), &stage_name).await?;

        let notion_blog_database_id =
            Self::try_get_notion_blog_database_id_async(ssm_client.clone()).await?;

        let notionrs_client = Self::get_notionrs_client(&notion_api_key);

        let elmethis_notion_client = Self::get_elmethis_notion_client(&notion_api_key);

        Ok(Self {
            stage_name,
            ssm_client,
            notion_api_key,
            notion_blog_database_id,
            notionrs_client,
            elmethis_notion_client,
        })
    }

    pub async fn try_get_stage_name_async() -> Result<String, crate::error::Error> {
        let stage_name = std::env::var("STAGE_NAME").map_err(|_| {
            tracing::error!("Environmental variable not found: STAGE_NAME");
            crate::error::Error::EnvironmentalVariableNotFound("STAGE_NAME".to_string())
        })?;

        tracing::debug!("STAGE_NAME: {}", stage_name);

        Ok(stage_name)
    }

    pub async fn try_get_aws_sdk_config_async() -> Result<aws_config::SdkConfig, crate::error::Error>
    {
        tracing::debug!("Loading AWS SDK Config");

        let aws_sdk_config = aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;

        Ok(aws_sdk_config)
    }

    pub async fn try_get_ssm_client_async(
        aws_sdk_config: &aws_config::SdkConfig,
    ) -> Result<std::sync::Arc<aws_sdk_ssm::Client>, crate::error::Error> {
        tracing::debug!("Creating SSM Client");

        let ssm_client = std::sync::Arc::new(aws_sdk_ssm::Client::new(aws_sdk_config));

        Ok(ssm_client)
    }

    pub fn get_notionrs_client(notion_api_key: &str) -> std::sync::Arc<notionrs::client::Client> {
        let notion_client = notionrs::client::Client::new().secret(notion_api_key);
        std::sync::Arc::new(notion_client)
    }

    pub fn get_elmethis_notion_client(
        notion_api_key: &str,
    ) -> std::sync::Arc<elmethis_notion::client::Client> {
        let get_elmethis_notion_client = elmethis_notion::client::Client::new(notion_api_key);
        std::sync::Arc::new(get_elmethis_notion_client)
    }

    pub async fn try_get_notion_api_key_async(
        ssm_client: std::sync::Arc<aws_sdk_ssm::Client>,
        stage_name: &str,
    ) -> Result<String, crate::error::Error> {
        let parameter_name: String =
            format!("/{stage_name}/46ki75/web/ssm/parameter/notion/secret");
        let notion_api_key = Self::try_get_ssm_parameter_async(ssm_client, &parameter_name).await?;
        Ok(notion_api_key)
    }

    pub async fn try_get_notion_blog_database_id_async(
        ssm_client: std::sync::Arc<aws_sdk_ssm::Client>,
    ) -> Result<String, crate::error::Error> {
        const PARAMETER_NAME: &str = "/shared/46ki75/web/ssm/parameter/notion/database/id";
        let notion_blog_database_id =
            Self::try_get_ssm_parameter_async(ssm_client, PARAMETER_NAME).await?;
        Ok(notion_blog_database_id)
    }

    async fn try_get_ssm_parameter_async(
        ssm_client: std::sync::Arc<aws_sdk_ssm::Client>,
        parameter_name: &str,
    ) -> Result<String, crate::error::Error> {
        let parameter = ssm_client
            .get_parameter()
            .name(parameter_name)
            .with_decryption(true)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Failed to get parameter: {}", e);
                crate::error::Error::SsmParameter(e.to_string())
            })?
            .parameter
            .ok_or_else(|| {
                tracing::error!("Parameter not found: {}", parameter_name);
                crate::error::Error::SsmParameter(format!(
                    "Parameter not found: {}",
                    parameter_name
                ))
            })?
            .value
            .ok_or_else(|| {
                tracing::error!("Parameter value not found: {}", parameter_name);
                crate::error::Error::SsmParameter(format!(
                    "Parameter value not found: {}",
                    parameter_name
                ))
            })?;

        tracing::debug!("Fetching SSM Parameter: {}", parameter_name);

        Ok(parameter)
    }
}
