resource "aws_s3_bucket" "frontend" {
  bucket        = "${terraform.workspace}-46ki75-web-s3-bucket-frontend"
  force_destroy = true
}

resource "aws_s3_object" "file" {
  bucket       = aws_s3_bucket.frontend.bucket
  key          = "index.html"
  content      = file("./index.html")
  content_type = "text/html"
  etag         = md5(file("./index.html"))
}

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "${aws_cloudfront_distribution.main.arn}"
          }
        }
      }
    ]
  })

}
