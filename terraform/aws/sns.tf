resource "aws_sns_topic" "sns_topic" {
  for_each = toset(["info", "warn", "error"])

  name = "${terraform.workspace}-46ki75-web-sns-topic-${each.key}"
}

resource "aws_sns_topic_policy" "sns_topic_policy" {
  for_each = aws_sns_topic.sns_topic
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
            "aws:SourceArn" : "arn:aws:cloudwatch:ap-northeast-1:${data.aws_caller_identity.current.account_id}:alarm:*"
          }
        }
      }
    ]
  })
}

resource "aws_sns_topic_subscription" "error_email" {
  topic_arn = aws_sns_topic.sns_topic["error"].arn
  protocol  = "email"
  endpoint  = "46ki75@gmail.com"
}
