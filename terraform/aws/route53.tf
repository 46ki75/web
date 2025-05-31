data "aws_route53_zone" "internal" {
  name = terraform.workspace == "prod" ? "www.ikuma.cloud" : "${terraform.workspace}-www.ikuma.cloud"
}
