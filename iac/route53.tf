# Fetch Route53 Hosted Zone ID
data "aws_route53_zone" "zone" {
  name         = "46ki75.com"
  private_zone = false
}

resource "aws_route53_record" "dev_records" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = "dev.www.46ki75.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.distribution.domain_name
    zone_id                = aws_cloudfront_distribution.distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

