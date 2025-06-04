//! Initializes subscriber's configuration.

use std::str::FromStr;

/// Initializes subscriber's configuration.
pub fn init_subscriber() {
    let log_format = std::env::var("AWS_LAMBDA_LOG_FORMAT").unwrap_or_default();
    let log_level_str =
        std::env::var("AWS_LAMBDA_LOG_LEVEL").or_else(|_| std::env::var("RUST_LOG"));
    let log_level = tracing::Level::from_str(log_level_str.as_deref().unwrap_or("INFO"))
        .unwrap_or(tracing::Level::INFO);

    let fmt = tracing_subscriber::fmt()
        .with_level(true)
        .with_file(true)
        .with_line_number(true)
        .with_env_filter(
            tracing_subscriber::EnvFilter::builder()
                .with_default_directive(
                    tracing_subscriber::filter::LevelFilter::from_level(log_level).into(),
                )
                .from_env_lossy(),
        );

    if log_format.eq_ignore_ascii_case("json") {
        fmt.json().init();
    } else if log_format.eq_ignore_ascii_case("pretty") {
        fmt.pretty().init(); // cargo add tracing_subscriber --features=ansi
    } else {
        fmt.init();
    };
}
