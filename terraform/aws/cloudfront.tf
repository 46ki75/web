resource "aws_cloudfront_origin_access_control" "web" {
  name                              = "${terraform.workspace}-46ki75-web-cloudfront-oac-web"
  description                       = "Frontend S3 OAC"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_cache_policy" "s3" {
  name = "${terraform.workspace}-46ki75-web-cloudfront-cache_policy-s3"

  default_ttl = 3600 * 24 * 30 * 6
  min_ttl     = 3600 * 24 * 30 * 1
  max_ttl     = 3600 * 24 * 30 * 12

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

resource "aws_cloudfront_cache_policy" "http_api" {
  name = "${terraform.workspace}-46ki75-web-cloudfront-cache_policy-http_api"

  default_ttl = 0
  min_ttl     = 0
  max_ttl     = 3600 * 24 * 30 * 12

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Accept-Language"]
      }
    }

    query_strings_config {
      query_string_behavior = "none"
    }

    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

resource "aws_cloudfront_origin_request_policy" "all_viewer" {

  name = "${terraform.workspace}-46ki75-web-cloudfront-origin_request_policy-all_viewer"

  cookies_config {
    cookie_behavior = "all"
  }
  headers_config {
    header_behavior = "allExcept"
    headers {
      items = ["Host"]
    }
  }
  query_strings_config {
    query_string_behavior = "all"
  }
}

resource "aws_cloudfront_response_headers_policy" "security" {

  name = "${terraform.workspace}-46ki75-web-cloudfront-response_headers_policy-security"

  cors_config {
    access_control_allow_origins {
      items = ["http://localhost:*"]
    }
    access_control_allow_methods {
      items = ["OPTIONS", "HEAD", "GET"]
    }

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_credentials = false
    origin_override                  = true
  }

  security_headers_config {

    strict_transport_security {
      override                   = true
      access_control_max_age_sec = 31536000
      include_subdomains         = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      override     = true
      frame_option = "SAMEORIGIN"
    }

    xss_protection {
      override   = true
      mode_block = true
      protection = true
    }

    referrer_policy {
      override        = true
      referrer_policy = "no-referrer"
    }
  }
}

resource "aws_cloudfront_distribution" "default" {
  depends_on = [aws_acm_certificate.cloudfront_cert, aws_acm_certificate_validation.cloudfront_cert_cert]

  comment = terraform.workspace

  http_version = "http2and3"
  enabled      = true

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  default_root_object = "index.html"

  # >>> custom domain
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cloudfront_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  aliases = [aws_acm_certificate.cloudfront_cert.domain_name]
  # <<< custom domain

  # >>> [S3 web] origin
  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS"
    ]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = "s3-web"

    cache_policy_id            = aws_cloudfront_cache_policy.s3.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.all_viewer.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    compress = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rename_uri.arn
    }
  }

  origin {
    domain_name              = aws_s3_bucket.web.bucket_regional_domain_name
    origin_id                = "s3-web"
    origin_access_control_id = aws_cloudfront_origin_access_control.web.id
  }
  # <<< [S3 web] origin

  # >>> [Lambda Function URLs] origin
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
    target_origin_id       = "api-backend"

    cache_policy_id            = aws_cloudfront_cache_policy.http_api.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.all_viewer.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    compress = true
  }

  origin {
    domain_name = local.lambda_function_url_domain_http_api
    origin_id   = "api-backend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  # <<< [Lambda Function URLs] origin


  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/redirect/index.html"
    error_caching_min_ttl = 0
  }
}

# <<< CloudFront Logging v2 <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/standard-logging.html>
resource "aws_cloudwatch_log_delivery_destination_policy" "s3_policy" {
  provider                  = aws.global
  delivery_destination_name = aws_cloudwatch_log_delivery_destination.cloudfront.name
  delivery_destination_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowLogsDeliveryToS3"
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "logs:CreateDelivery"
        Resource = "arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:delivery-destination:${aws_cloudwatch_log_delivery_destination.cloudfront.name}"
      }
    ]
  })
}

resource "aws_cloudwatch_log_delivery_destination" "cloudfront" {
  provider      = aws.global
  name          = "${terraform.workspace}-46ki75-web-cloudwatch-delivery_destination-cloudfront"
  output_format = "parquet"

  delivery_destination_configuration {
    destination_resource_arn = aws_s3_bucket.cloudfront.arn
  }
}

resource "aws_cloudwatch_log_delivery_source" "cloudfront" {
  provider     = aws.global
  name         = "${terraform.workspace}-46ki75-web-cloudwatch-delivery_source-cloudfront"
  log_type     = "ACCESS_LOGS"
  resource_arn = aws_cloudfront_distribution.default.arn
}

resource "aws_cloudwatch_log_delivery" "cloudfront" {
  provider                 = aws.global
  delivery_source_name     = aws_cloudwatch_log_delivery_source.cloudfront.name
  delivery_destination_arn = aws_cloudwatch_log_delivery_destination.cloudfront.arn

  record_fields = [
    "date",
    "time",
    "c-ip",
    "cs-method",
    "cs-uri-stem",
    "sc-status",
    "cs(Referer)",
    "cs-uri-query",
    "x-edge-result-type",
    "time-taken",
    "cs-protocol-version",
    "sc-content-type",
  ]

  s3_delivery_configuration {
    suffix_path = "/{yyyy}/{MM}/{dd}/{HH}"
  }
}
# >>> CloudFront Logging v2

# >>> CloudFront Function
resource "aws_cloudfront_key_value_store" "basic" {
  name = "${terraform.workspace}-46ki75-web-cloudfront-kvs-basic"
}

locals {
  kvs_id = element(split("/", aws_cloudfront_key_value_store.basic.arn), length(split("/", aws_cloudfront_key_value_store.basic.arn)) - 1)
}

resource "aws_cloudfront_function" "rename_uri" {
  name    = "${terraform.workspace}-46ki75-cloudfront-web-function-rename-uri"
  runtime = "cloudfront-js-2.0"
  comment = "Rename URI to index.html"
  publish = true
  code = terraform.workspace == "prod" ? file("${path.module}/assets/renameUri.js") : templatefile("${path.module}/assets/renameUriBasic.js", {
    KVS_ID = local.kvs_id
  })
  key_value_store_associations = [aws_cloudfront_key_value_store.basic.arn]
}
# <<< CloudFront Function

resource "aws_route53_record" "cloudfront" {
  zone_id = data.aws_route53_zone.internal.zone_id
  name    = aws_acm_certificate.cloudfront_cert.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.default.domain_name
    zone_id                = aws_cloudfront_distribution.default.hosted_zone_id
    evaluate_target_health = false
  }
}

// @see <https://docs.aws.amazon.com/acm/latest/userguide/setup.html#setup-caa>
resource "aws_route53_record" "cloudfront_caa" {
  zone_id = data.aws_route53_zone.internal.zone_id
  name    = aws_acm_certificate.cloudfront_cert.domain_name
  type    = "CAA"
  ttl     = 300
  records = [
    "0 issue \"amazon.com\"",
    "0 issue \"amazontrust.com\"",
    "0 issue \"awstrust.com\"",
    "0 issue \"amazonaws.com\"",
    "0 issuewild \"amazon.com\""
  ]
}

output "cloudfront_url" {
  value = "https://${aws_route53_record.cloudfront.fqdn}"
}
