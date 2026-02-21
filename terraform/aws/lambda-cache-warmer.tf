resource "aws_iam_role" "lambda_role_cache_warmer" {
  name = "${terraform.workspace}-46ki75-web-iam-role-lambda-cache_warmer"
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

resource "aws_iam_policy" "lambda_policy_cache_warmer" {
  name        = "${terraform.workspace}-46ki75-web-iam-policy-lambda-cache_warmer"
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

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment_cache_warmer" {
  role       = aws_iam_role.lambda_role_cache_warmer.name
  policy_arn = aws_iam_policy.lambda_policy_cache_warmer.arn
}

resource "aws_lambda_function" "cache_warmer" {
  function_name = "${terraform.workspace}-46ki75-web-lambda-function-cache_warmer"
  role          = aws_iam_role.lambda_role_cache_warmer.arn
  filename      = "${path.module}/assets/bootstrap.zip"
  handler       = "bootstrap.handler"
  runtime       = "provided.al2023"
  architectures = ["arm64"]
  memory_size   = 512
  publish       = true # Publish a new version
  timeout       = 15 * 60

  tracing_config {
    mode = "PassThrough"
  }

  logging_config {
    log_group             = aws_cloudwatch_log_group.cache_warmer.name
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

resource "aws_lambda_alias" "cache_warmer" {
  name             = "stable"
  function_name    = aws_lambda_function.cache_warmer.function_name
  function_version = "$LATEST"
}
