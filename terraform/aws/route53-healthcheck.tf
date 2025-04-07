resource "aws_route53_health_check" "cloudfront" {
  provider = aws.global # us-east-1

  fqdn              = aws_acm_certificate.cloudfront_cert.domain_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/api/health"
  failure_threshold = "1"
  request_interval  = "30"

  tags = {
    Name = "${terraform.workspace}-46ki75-web-route53-healthcheck-cloudfront"
  }
}

resource "aws_cloudwatch_metric_alarm" "healthcheck_cloudfront" {
  provider = aws.global # us-east-1

  alarm_name          = "${terraform.workspace}-46ki75-web-cloudwatch-alarm-route53-healthcheck-cloudfront"
  alarm_description   = "Alarm when cloudfront healthcheck fails"
  comparison_operator = "LessThanThreshold"

  namespace   = "AWS/Route53"
  metric_name = "HealthCheckPercentageHealthy"
  dimensions = {
    HealthCheckId = aws_route53_health_check.cloudfront.id
  }

  period              = 60
  evaluation_periods  = 1
  statistic           = "Average"
  datapoints_to_alarm = 1
  threshold           = 1
  alarm_actions       = [aws_sns_topic.error_global.arn]
  treat_missing_data  = "notBreaching"
}
