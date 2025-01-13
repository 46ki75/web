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

