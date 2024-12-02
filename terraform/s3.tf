resource "aws_s3_bucket" "web" {
  bucket        = "46ki75-web-static"
  force_destroy = true
}

resource "aws_s3_object" "file" {
  bucket       = aws_s3_bucket.web.bucket
  key          = "index.html"
  content      = file("./index.html")
  content_type = "text/html"
  etag         = md5(file("./index.html"))
}

# resource "aws_s3_object" "error" {
#   bucket       = aws_s3_bucket.web.bucket
#   key          = "error.html"
#   content      = file("./error.html")
#   content_type = "text/html"
#   etag         = md5(file("./error.html"))
# }

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id
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
        Resource = "${aws_s3_bucket.web.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "${aws_cloudfront_distribution.web.arn}"
          }
        }
      }
    ]
  })

}
