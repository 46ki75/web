pub trait WebConfigRepository: Send + Sync {
    fn fetch_parameter(
        &self,
        parameter_name: String,
    ) -> std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<String, crate::error::Error>> + Send>,
    >;
}

#[derive(Debug, Clone)]
pub struct WebConfigRepositoryImpl {}

impl WebConfigRepository for WebConfigRepositoryImpl {
    fn fetch_parameter(
        &self,
        parameter_name: String,
    ) -> std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<String, crate::error::Error>> + Send>,
    > {
        Box::pin(async move {
            let request =
                crate::once_cell_cache::ssm_parameter::try_get_ssm_parameter_async(&parameter_name);

            let parameter = request.await?;

            Ok(parameter)
        })
    }
}
