variable "static_site_stages" {
  description = "Stages running the static S3 frontend. Upload a release before enabling a stage."
  type        = set(string)
  default     = []

  validation {
    condition     = alltrue([for stage in var.static_site_stages : contains(["dev", "stg", "prod"], stage)])
    error_message = "Static site stages must be dev, stg, or prod."
  }
}

locals {
  static_site_enabled = contains(var.static_site_stages, terraform.workspace)
}

# Keep the policy and function available on rollback. CloudFront refuses to
# delete either while a deployed distribution still references it.
resource "aws_cloudfront_cache_policy" "static_site" {
  name        = "${terraform.workspace}-46ki75-web-cloudfront-cache_policy-static_site"
  default_ttl = 0
  min_ttl     = 0
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

resource "aws_cloudfront_function" "static_site" {
  name    = "${terraform.workspace}-46ki75-web-cloudfront-function-static_site"
  runtime = "cloudfront-js-2.0"
  comment = "Static routing and custom 404 for the S3 website origin"
  publish = true

  code = templatefile("${path.module}/assets/staticSite.js", {
    require_auth = terraform.workspace != "prod"
  })
  key_value_store_associations = [aws_cloudfront_key_value_store.basic.arn]
}

moved {
  from = aws_cloudfront_cache_policy.static_site[0]
  to   = aws_cloudfront_cache_policy.static_site
}

moved {
  from = aws_cloudfront_function.static_site[0]
  to   = aws_cloudfront_function.static_site
}
