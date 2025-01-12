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
  name               = "${terraform.workspace}-46ki75-web-iam-role-api"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_ssm_parameter" "api_env_NOTION_API_KEY" {
  name            = "/${terraform.workspace}/46ki75/web/ssm/parameter/notion/secret"
  with_decryption = true
}

data "aws_ssm_parameter" "api_env_NOTION_BLOG_DATABASE_ID" {
  name = "/shared/46ki75/web/ssm/parameter/notion/database/id"
}

resource "aws_lambda_function" "api" {
  function_name = "${terraform.workspace}-46ki75-web-lambda-function-api"
  filename      = "./dist/bootstrap.zip"
  role          = aws_iam_role.iam_for_lambda.arn
  runtime       = "provided.al2023"
  handler       = "does.not.matter"

  environment {
    variables = {
      NOTION_API_KEY          = data.aws_ssm_parameter.api_env_NOTION_API_KEY.value
      NOTION_BLOG_DATABASE_ID = data.aws_ssm_parameter.api_env_NOTION_BLOG_DATABASE_ID.value
    }
  }
}

resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"
}

