resource "aws_cloudwatch_log_group" "lambda_http" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_http"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_subscription_filter" "lambda_http_warn" {
  name            = "${terraform.workspace}-46ki75-internal-cloudwatch-subscription_filter-lambda_http_warn"
  log_group_name  = aws_cloudwatch_log_group.lambda_http.name
  filter_pattern  = "{$.level=\"WARN\"}"
  destination_arn = aws_lambda_function.reporter.arn
}

resource "aws_cloudwatch_log_subscription_filter" "lambda_http_error" {
  name            = "${terraform.workspace}-46ki75-internal-cloudwatch-subscription_filter-lambda_http_error"
  log_group_name  = aws_cloudwatch_log_group.lambda_http.name
  filter_pattern  = "{$.level=\"ERROR\"}"
  destination_arn = aws_lambda_function.reporter.arn
}

resource "aws_cloudwatch_log_group" "lambda_nitro" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_nitro"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_subscription_filter" "lambda_nitro_warn" {
  name            = "${terraform.workspace}-46ki75-internal-cloudwatch-subscription_filter-lambda_nitro_warn"
  log_group_name  = aws_cloudwatch_log_group.lambda_nitro.name
  filter_pattern  = "{$.level=\"WARN\"}"
  destination_arn = aws_lambda_function.reporter.arn
}

resource "aws_cloudwatch_log_subscription_filter" "lambda_nitro_error" {
  name            = "${terraform.workspace}-46ki75-internal-cloudwatch-subscription_filter-lambda_nitro_error"
  log_group_name  = aws_cloudwatch_log_group.lambda_nitro.name
  filter_pattern  = "{$.level=\"ERROR\"}"
  destination_arn = aws_lambda_function.reporter.arn
}

resource "aws_cloudwatch_log_group" "cache_warmer" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/cache_warmer"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_subscription_filter" "cache_warmer_warn" {
  name            = "${terraform.workspace}-46ki75-internal-cloudwatch-subscription_filter-cache_warmer_warn"
  log_group_name  = aws_cloudwatch_log_group.cache_warmer.name
  filter_pattern  = "{$.level=\"WARN\"}"
  destination_arn = aws_lambda_function.reporter.arn
}

resource "aws_cloudwatch_log_subscription_filter" "cache_warmer_error" {
  name            = "${terraform.workspace}-46ki75-internal-cloudwatch-subscription_filter-cache_warmer_error"
  log_group_name  = aws_cloudwatch_log_group.cache_warmer.name
  filter_pattern  = "{$.level=\"ERROR\"}"
  destination_arn = aws_lambda_function.reporter.arn
}

resource "aws_cloudwatch_log_group" "lambda_reporter" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_reporter"
  retention_in_days = 30
}
