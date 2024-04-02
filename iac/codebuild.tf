resource "aws_codebuild_project" "web-dev" {
  name          = "web-dev"
  description   = "Build Nuxt.js site"
  build_timeout = "10"
  service_role  = aws_iam_role.codebuild.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type = "BUILD_LAMBDA_10GB"
    # see https://docs.aws.amazon.com/ja_jp/codebuild/latest/userguide/build-env-ref-available.html#ec2-compute-images
    image = "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs20"
    type  = "LINUX_LAMBDA_CONTAINER"

    environment_variable {
      name  = "NEXT_PUBLIC_VARIABLE_NAME"
      value = "value"
    }
  }

  source {
    type            = "GITHUB"
    location        = "https://github.com/46ki75/web.git"
    buildspec       = "buildspec.yml"
    git_clone_depth = 1
  }

  # cache {
  #   type  = "LOCAL"
  #   modes = ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_SOURCE_CACHE", "LOCAL_CUSTOM_CACHE"]
  # }
}