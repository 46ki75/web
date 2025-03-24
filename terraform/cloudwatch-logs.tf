resource "aws_cloudwatch_log_group" "lambda_graphql" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_graphql"
  retention_in_days = 30
}
