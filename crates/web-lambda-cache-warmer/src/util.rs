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
