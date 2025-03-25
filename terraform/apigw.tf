resource "aws_apigatewayv2_api" "backend" {
  name          = "${terraform.workspace}-46ki75-web-apigwv2-http-backend"
  protocol_type = "HTTP"

  route_key = "ANY /{proxy+}"
  target    = aws_lambda_alias.http_api.invoke_arn
}

resource "aws_apigatewayv2_stage" "backend" {
  api_id      = aws_apigatewayv2_api.backend.id
  name        = "api"
  auto_deploy = true

  route_settings {
    route_key              = "$default"
    throttling_burst_limit = 100000
    throttling_rate_limit  = 100000
  }
}

resource "aws_apigatewayv2_domain_name" "backend" {
  depends_on  = [aws_acm_certificate.api_cert, aws_acm_certificate_validation.api_cert]
  domain_name = aws_acm_certificate.api_cert.domain_name
  domain_name_configuration {
    certificate_arn = aws_acm_certificate.api_cert.arn
    security_policy = "TLS_1_2"
    endpoint_type   = "REGIONAL"
  }
}

resource "aws_apigatewayv2_api_mapping" "backend" {
  api_id      = aws_apigatewayv2_api.backend.id
  domain_name = aws_apigatewayv2_domain_name.backend.domain_name
  stage       = aws_apigatewayv2_stage.backend.name
}

resource "aws_route53_record" "api_gateway" {
  zone_id = data.aws_route53_zone.internal.zone_id
  name    = aws_apigatewayv2_domain_name.backend.domain_name
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.backend.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.backend.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_lambda_permission" "apigwv2" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_alias.http_api.function_name
  qualifier     = aws_lambda_alias.http_api.name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.backend.execution_arn}/*/*/*"
}

output "backend_apigw_url" {
  value = "https://${aws_apigatewayv2_domain_name.backend.domain_name}"
}

