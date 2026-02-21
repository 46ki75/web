pub async fn get_parameter(name: &str) -> Result<String, String> {
    let client = aws_sdk_ssm::Client::new(&aws_config::load_from_env().await);

    let resp = client
        .get_parameter()
        .name(name)
        .with_decryption(true)
        .send()
        .await
        .map_err(|e| format!("Failed to get parameter {}: {}", name, e))?;

    resp.parameter()
        .and_then(|param| param.value().map(|v| v.to_string()))
        .ok_or_else(|| format!("Parameter {} not found or has no value", name))
}
