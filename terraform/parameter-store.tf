resource "aws_ssm_parameter" "cognito_user_pool_id" {
  name  = "/${terraform.workspace}/46ki75/web/cognito/userpool/id"
  type  = "String"
  value = aws_cognito_user_pool.default.id
}

resource "aws_ssm_parameter" "cognito_user_pool_client_id" {
  name  = "/${terraform.workspace}/46ki75/web/cognito/userpool/client/id"
  type  = "String"
  value = aws_cognito_user_pool_client.spa.id
}
