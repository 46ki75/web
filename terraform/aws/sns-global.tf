resource "aws_sns_topic" "sns_topic_global" {
  for_each = toset(["info", "warn", "error"])
  provider = aws.global

  name = "${terraform.workspace}-46ki75-web-sns-topic-${each.key}"
}

resource "aws_sns_topic_policy" "sns_topic_global_policy" {
  for_each = aws_sns_topic.sns_topic_global
  provider = aws.global
  arn      = each.value.arn

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "AWS" : "*"
        },
        "Action" : "sns:Publish",
        "Resource" : each.value.arn,
        "Condition" : {
          "ArnLike" : {
            "aws:SourceArn" : "arn:aws:cloudwatch:us-east-1:${data.aws_caller_identity.current.account_id}:alarm:*"
          }
        }
      }
    ]
  })
}

resource "aws_sns_topic_subscription" "error_email_global" {
  provider = aws.global

  topic_arn = aws_sns_topic.sns_topic_global["error"].arn
  protocol  = "email"
  endpoint  = "46ki75@gmail.com"
}
