resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${terraform.workspace}-46ki75-web-cloudfront-oac-frontend"
  description                       = "OIC for S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_response_headers_policy" "default" {
  name = "${terraform.workspace}-46ki75-web-cloudfront-response-headers-policy-default"

  security_headers_config {
    # strict-transport-security
    strict_transport_security {
      override                   = true
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
    }

    # x-content-type-options
    content_type_options {
      override = true
    }

    # x-frame-options
    frame_options {
      override     = true
      frame_option = "SAMEORIGIN"
    }
  }
}

resource "aws_cloudfront_distribution" "main" {
  comment      = "${terraform.workspace}-46ki75-web-cloudfront-distribution-main"
  enabled      = true
  http_version = "http2and3"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # >>> custom domain
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cloudfront_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  aliases = [aws_acm_certificate.cloudfront_cert.domain_name]
  # <<< custom domain

  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT"
    ]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = "frontend"

    default_ttl = 3600 * 24 * 30
    min_ttl     = 0
    max_ttl     = 3600 * 24 * 30 * 12

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
      headers = ["etag"]
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.default.id
  }

  ordered_cache_behavior {
    path_pattern = "/api/*"
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT"
    ]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = "api"

    default_ttl = 0
    min_ttl     = 0
    max_ttl     = 0

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  origin {
    domain_name = regex("https?://([^/]+)", aws_lambda_function_url.api.function_url)[0]
    origin_id   = "api"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_root_object = "index.html"

  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/error.html"
    error_caching_min_ttl = 0
  }
}
