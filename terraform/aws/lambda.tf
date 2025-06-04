# http_api ----------

resource "aws_iam_role" "lambda_role_http_api" {
  name = "${terraform.workspace}-46ki75-web-iam-role-lambda-http_api"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "lambda.amazonaws.com"
        },
        "Action" : "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy_http_api" {
  name        = "${terraform.workspace}-46ki75-web-iam-policy-lambda-http_api"
  description = "Allow lambda to access cloudwatch logs"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ssm:GetParameter",
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "ssm:GetParameter"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment_http_api" {
  role       = aws_iam_role.lambda_role_http_api.name
  policy_arn = aws_iam_policy.lambda_policy_http_api.arn
}

resource "aws_lambda_function" "http_api" {
  function_name = "${terraform.workspace}-46ki75-web-lambda-function-http_api"
  role          = aws_iam_role.lambda_role_http_api.arn
  filename      = "${path.module}/assets/bootstrap.zip"
  handler       = "bootstrap.handler"
  runtime       = "provided.al2023"
  architectures = ["x86_64"]
  publish       = true # Publish a new version
  timeout       = 30

  tracing_config {
    mode = "Active"
  }

  logging_config {
    log_group             = aws_cloudwatch_log_group.lambda_http.name
    log_format            = "JSON"
    application_log_level = "INFO"
    system_log_level      = "WARN"
  }

  environment {
    variables = {
      STAGE_NAME = terraform.workspace
    }
  }
}

resource "aws_lambda_alias" "http_api" {
  name             = "stable"
  function_name    = aws_lambda_function.http_api.function_name
  function_version = "$LATEST"
}

resource "aws_lambda_function_url" "http_api" {
  authorization_type = "NONE"
  function_name      = aws_lambda_function.http_api.function_name
  qualifier          = aws_lambda_alias.http_api.name
}

locals {
  lambda_function_url_domain_http_api = split("/", replace(aws_lambda_function_url.http_api.function_url, "https://", ""))[0]
}
