terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.76"
    }
  }


  # When using a non-default workspace, the state path will be `<workspace_key_prefix>/<workspace_name>/<key>`
  # @see https://developer.hashicorp.com/terraform/language/backend/s3#key
  # RUN: terraform workspace show
  # RUN: terraform workspace list
  # RUN: terraform workspace select dev
  backend "s3" {
    bucket               = "shared-46ki75-web-s3-bucket-terraform-tfstate"
    workspace_key_prefix = "workspace"
    key                  = "terraform.tfstate"
    region               = "ap-northeast-1"
    encrypt              = true
    use_lockfile         = true
  }
}

provider "aws" {
  alias  = "primary"
  region = "ap-northeast-1"
}

provider "aws" {
  alias  = "global"
  region = "us-east-1"
}

locals {
  stage_name_list = ["dev", "stg", "prod"]
}

resource "null_resource" "validate_workspace" {
  lifecycle {
    postcondition {
      condition     = contains(local.stage_name_list, terraform.workspace)
      error_message = "Invalid workspace. Available workspaces: ${join(", ", local.stage_name_list)}"
    }
  }
}

provider "github" {
  # token = var.github_token # or use GITHUB_TOKEN env var
  owner = "46ki75"
}
