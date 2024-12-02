// # --------------------------------------------------------------------------------
//
// CloudFront
//
// # --------------------------------------------------------------------------------

resource "aws_cloudfront_distribution" "lambda_url" {
  enabled = true

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  default_cache_behavior {
    allowed_methods        = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods         = ["HEAD", "GET"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = "graphql"

    default_ttl = 0
    min_ttl     = 0
    max_ttl     = 0

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }
  }

  origin {
    domain_name = regex("https?://([^/]+)", aws_lambda_function_url.graphql.function_url)[0]
    origin_id   = "graphql"
    origin_path = "/graphql"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  tags = {
    name = "web"
  }
}
