module "aws" {
  source = "./modules/aws"

  providers = {
    aws         = aws.primary
    aws.primary = aws.primary
    aws.global  = aws.global
  }
}

module "github" {
  source     = "./modules/github"
  owner      = "46ki75"
  repository = "web"
}
