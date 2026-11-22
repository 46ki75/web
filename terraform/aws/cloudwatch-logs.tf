# Let historical HTTP API logs age out under the existing retention policy.
resource "aws_cloudwatch_log_group" "lambda_http" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_http"
  retention_in_days = 30
}

# Let historical Nitro logs age out under the existing retention policy.
resource "aws_cloudwatch_log_group" "lambda_nitro" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_nitro"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "lambda_reporter" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/lambda_reporter"
  retention_in_days = 30
}

# Let historical Rust publisher logs age out under the existing retention policy.
resource "aws_cloudwatch_log_group" "blog_publisher" {
  name              = "/${terraform.workspace}/46ki75/web/cloudwatch/log_group/blog_publisher"
  retention_in_days = 30
}
