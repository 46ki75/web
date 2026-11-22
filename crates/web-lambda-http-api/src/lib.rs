pub mod blog;
pub mod error;
pub mod once_cell_cache;

pub fn stage_name() -> Result<String, crate::error::Error> {
    let stage_name = std::env::var("STAGE_NAME").map_err(|_| {
        let error = crate::error::Error::EnvironmentVariableNotFound {
            variable_name: "STAGE_NAME".to_owned(),
        };
        tracing::error!("{}", error);
        error
    })?;
    Ok(stage_name)
}

pub fn domain_name() -> Result<String, crate::error::Error> {
    let stage_name = crate::stage_name()?;

    let domain = match stage_name.as_str() {
        "prod" => "www.ikuma.cloud",
        "staging" => "stg-www.ikuma.cloud",
        _ => "dev-www.ikuma.cloud",
    };
    Ok(domain.to_owned())
}
