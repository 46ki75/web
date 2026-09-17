use aws_config::BehaviorVersion;
use aws_lambda_events::event::cloudwatch_logs::LogsEvent;
use lambda_runtime::{Error, LambdaEvent};

#[derive(Debug)]
enum Level {
    Debug,
    Info,
    Warn,
    Error,
}

impl std::fmt::Display for Level {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // Preserve uppercase level labels in SNS notifications.
        f.write_str(match self {
            Self::Debug => "DEBUG",
            Self::Info => "INFO",
            Self::Warn => "WARN",
            Self::Error => "ERROR",
        })
    }
}

pub(crate) async fn function_handler(event: LambdaEvent<LogsEvent>) -> Result<(), Error> {
    let sns_info_topic_arn = std::env::var("SNS_INFO_TOPIC_ARN")?;
    let sns_warn_topic_arn = std::env::var("SNS_WARN_TOPIC_ARN")?;
    let sns_error_topic_arn = std::env::var("SNS_ERROR_TOPIC_ARN")?;

    let subscription_filters = &event.payload.aws_logs.data.subscription_filters;

    let level = if subscription_filters.iter().any(|f| f.contains("_debug")) {
        Level::Debug
    } else if subscription_filters.iter().any(|f| f.contains("_info")) {
        Level::Info
    } else if subscription_filters.iter().any(|f| f.contains("_warn")) {
        Level::Warn
    } else if subscription_filters.iter().any(|f| f.contains("_error")) {
        Level::Error
    } else {
        Level::Info
    };

    let topic_arn = match level {
        Level::Debug | Level::Info => sns_info_topic_arn,
        Level::Warn => sns_warn_topic_arn,
        Level::Error => sns_error_topic_arn,
    };

    let message = format!(
        "| Log Group: {} |\nAn {} level message was captured by the subscription filter.",
        event.payload.aws_logs.data.log_group, level
    );

    let logs = event
        .payload
        .aws_logs
        .data
        .log_events
        .into_iter()
        .map(|log_event| {
            let message_body = serde_json::from_str::<serde_json::Value>(&log_event.message)
                .and_then(|v| serde_json::to_string_pretty(&v))
                .unwrap_or(log_event.message);

            format!(
                "| Timestamp: {} | -------------------------------------------------- |\n{}",
                log_event.timestamp, message_body,
            )
        })
        .collect::<Vec<String>>();

    let full_message = format!("{}\nLogs:\n{}", message, logs.join("\n\n"));

    let sdk_config = aws_config::load_defaults(BehaviorVersion::latest()).await;
    let client = aws_sdk_sns::Client::new(&sdk_config);

    let _response: aws_sdk_sns::operation::publish::PublishOutput = client
        .publish()
        .topic_arn(topic_arn)
        .message(full_message)
        .send()
        .await?;

    Ok(())
}
