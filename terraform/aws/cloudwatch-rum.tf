resource "aws_rum_app_monitor" "default" {
  name   = "${terraform.workspace}-46ki75-web-rum-monitor-default"
  domain = aws_acm_certificate.cloudfront_cert.domain_name
}

resource "aws_rum_metrics_destination" "default" {
  app_monitor_name = aws_rum_app_monitor.default.name
  destination      = "CloudWatch"
}
