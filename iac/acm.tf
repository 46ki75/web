module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> 4.0"

  providers = {
    aws = aws.us-east-1
  }

  domain_name = "dev.www.46ki75.com"
  zone_id     = data.aws_route53_zone.zone.zone_id

  validation_method = "DNS"

  wait_for_validation = true

}
