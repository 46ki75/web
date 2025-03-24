resource "aws_cloudwatch_log_group" "lambda_http" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_http"
  retention_in_days = 30
}

