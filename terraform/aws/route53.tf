data "aws_route53_zone" "internal" {
  name = terraform.workspace == "prod" ? "www.46ki75.com" : "${terraform.workspace}-www.46ki75.com"
}
