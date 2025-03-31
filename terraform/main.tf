module "aws" {
  source = "./modules/aws"

  providers = {
    aws         = aws.primary
    aws.primary = aws.primary
    aws.global  = aws.global
  }
}
