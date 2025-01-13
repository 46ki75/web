resource "aws_route53_zone" "main" {
  name = lookup(
    {
      "dev"  = "dev-www.46ki75.com",
      "stg"  = "stg-www.46ki75.com",
      "prod" = "www.46ki75.com"
    },
    terraform.workspace
  )
}

output "name_servers" {
  value       = aws_route53_zone.main.name_servers
  description = "You need to update your parent domain's NS records with these values"
}

resource "aws_route53_record" "cloudfront" {
  zone_id = aws_route53_zone.main.zone_id
  name    = aws_acm_certificate.cloudfront_cert.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

output "cloudfront_url" {
  value = "https://${aws_route53_record.cloudfront.fqdn}"
}
