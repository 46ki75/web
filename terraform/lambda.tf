// # --------------------------------------------------------------------------------
//
// Lambda Functions
//
// # --------------------------------------------------------------------------------

data "archive_file" "lambda" {
  type        = "zip"
  source_file = "../target/lambda/graphql/bootstrap"
  output_path = "dist/bootstrap.zip"
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_lambda_function" "graphql" {
  function_name = "web-graphql"
  filename      = "./dist/bootstrap.zip"
  role          = aws_iam_role.iam_for_lambda.arn
  runtime       = "provided.al2023"
  handler       = "does.not.matter"
}

resource "aws_lambda_function_url" "graphql" {
  function_name      = aws_lambda_function.graphql.function_name
  authorization_type = "NONE"
}

