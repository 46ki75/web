terraform {
  backend "s3" {
    bucket  = "internal-general-common-s3-terraform"
    key     = "web/terraform.tfstate"
    region  = "ap-northeast-1"
    encrypt = true
  }
}
