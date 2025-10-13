use tokio::sync::OnceCell;

static STAGE_NAME: OnceCell<String> = OnceCell::const_new();

pub async fn stage_name() -> Result<&'static String, crate::error::Error> {
    STAGE_NAME
        .get_or_try_init(|| async {
            let stage_name = std::env::var("STAGE_NAME").map_err(|_| {
                let error = crate::error::Error::EnvironmentVariableNotFound {
                    variable_name: "STAGE_NAME".to_owned(),
                };
                tracing::error!("{}", error);
                error
            })?;
            Ok(stage_name)
        })
        .await
}
