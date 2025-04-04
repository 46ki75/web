resource "aws_athena_workgroup" "default" {
  name = "${terraform.workspace}-46ki75-web-athena-workgroup-default"
  configuration {
    result_configuration {
      output_location = "s3://${aws_s3_bucket.athena.bucket}/"
    }
  }
}
