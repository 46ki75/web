resource "aws_acm_certificate" "cloudfront_cert" {
  provider = aws.us-east-1 # us-east-1

  domain_name = lookup(
    {
      "dev"  = "dev-www.46ki75.com",
      "stg"  = "stg-www.46ki75.com",
      "prod" = "www.46ki75.com"
    },
    terraform.workspace
  )
  validation_method = "DNS"
}

resource "aws_route53_record" "cloudfront_cert_validation" {
  provider = aws.us-east-1 # us-east-1

  for_each = {
    for dvo in aws_acm_certificate.cloudfront_cert.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cloudfront_cert_cert" {
  provider = aws.us-east-1 # us-east-1

  certificate_arn = aws_acm_certificate.cloudfront_cert.arn
  validation_record_fqdns = [
    for record in aws_route53_record.cloudfront_cert_validation :
    record.fqdn
  ]
}
