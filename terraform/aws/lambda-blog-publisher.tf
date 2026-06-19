# blog_publisher ----------
#
# Rebuilds the static blog cache in S3 from the current Notion state.
# Invoked manually (`cargo lambda invoke` / `aws lambda invoke`); a schedule or
# Notion-webhook trigger can be added later — the rebuild is idempotent.

resource "aws_iam_role" "lambda_role_blog_publisher" {
  name = "${terraform.workspace}-46ki75-web-iam-role-lambda-blog_publisher"
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

resource "aws_iam_policy" "lambda_policy_blog_publisher" {
  name        = "${terraform.workspace}-46ki75-web-iam-policy-lambda-blog_publisher"
  description = "Allow blog publisher lambda to access logs, ssm, and the blog cache bucket"
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
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ],
        "Resource" : [
          aws_s3_bucket.blog_cache.arn,
          "${aws_s3_bucket.blog_cache.arn}/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "cloudfront:CreateInvalidation"
        ],
        "Resource" : aws_cloudfront_distribution.default.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment_blog_publisher" {
  role       = aws_iam_role.lambda_role_blog_publisher.name
  policy_arn = aws_iam_policy.lambda_policy_blog_publisher.arn
}

resource "aws_lambda_function" "blog_publisher" {
  function_name = "${terraform.workspace}-46ki75-web-lambda-function-blog_publisher"
  role          = aws_iam_role.lambda_role_blog_publisher.arn
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
    log_group             = aws_cloudwatch_log_group.blog_publisher.name
    log_format            = "JSON"
    application_log_level = "INFO"
    system_log_level      = "WARN"
  }

  environment {
    variables = {
      STAGE_NAME                 = terraform.workspace
      CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.default.id
    }
  }
}

resource "aws_lambda_alias" "blog_publisher" {
  name             = "stable"
  function_name    = aws_lambda_function.blog_publisher.function_name
  function_version = "$LATEST"
}
