use std::time::Duration;

use base64::prelude::*;

pub fn get_base_domain(stage_name: &str) -> String {
    match stage_name {
        "prod" => "www.ikuma.cloud".to_owned(),
        _ => format!("{}-www.ikuma.cloud", stage_name),
    }
}

pub fn create_basic_auth_header_value(username: &str, password: &str) -> String {
    let credentials = format!("{}:{}", username, password);
    let encoded_credentials = BASE64_STANDARD.encode(credentials);
    format!("Basic {}", encoded_credentials)
}

pub async fn execute_with_retry<MakeFut, Fut, O, E>(
    async_function: MakeFut,
    max_retries: u32,
) -> Result<O, E>
where
    MakeFut: Fn() -> Fut,
    Fut: std::future::Future<Output = Result<O, E>>,
{
    let mut attempt: u32 = 0;
    loop {
        match async_function().await {
            Ok(result) => return Ok(result),
            Err(e) => {
                attempt += 1;
                if attempt > max_retries {
                    return Err(e);
                }
            }
        }

        tokio::time::sleep(Duration::from_secs(2_u64.pow(attempt))).await;
    }
}
