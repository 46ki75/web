resource "aws_cloudwatch_log_group" "lambda_http" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_http"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "lambda_nitro" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_nitro"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "cache_warmer" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/cache_warmer"
  retention_in_days = 30
}

