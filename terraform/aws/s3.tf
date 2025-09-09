resource "aws_s3_bucket" "web" {
  bucket = "${terraform.workspace}-46ki75-web-s3-bucket-web"
}

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontGetObject"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = ["s3:GetObject"]
        Resource  = "${aws_s3_bucket.web.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "${aws_cloudfront_distribution.default.arn}"
          }
        }
      },
      {
        Sid       = "AllowCloudFrontListBucketForPrefixOnly"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = ["s3:ListBucket"]
        Resource  = "${aws_s3_bucket.web.arn}"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "${aws_cloudfront_distribution.default.arn}"
          }
          StringLike = {
            "s3:prefix" = ["*"]
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket" "cloudfront" {
  bucket = "${terraform.workspace}-46ki75-web-s3-bucket-cloudfront"
}

resource "aws_s3_bucket_policy" "cloudfront" {
  bucket = aws_s3_bucket.cloudfront.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSLogsDeliveryWrite"
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.cloudfront.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl"      = "bucket-owner-full-control",
            "AWS:SourceAccount" = "${data.aws_caller_identity.current.account_id}"
          }
          ArnLike = {
            "aws:SourceArn" = "${aws_cloudwatch_log_delivery_source.cloudfront.arn}"
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket" "athena" {
  bucket = "${terraform.workspace}-46ki75-web-s3-bucket-athena"
}
