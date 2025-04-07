resource "aws_sns_topic" "error_global" {
  provider = aws.global

  name = "${terraform.workspace}-46ki75-web-sns-topic-error"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "AWS" : "*"
        },
        "Action" : "sns:Publish",
        "Resource" : "*",
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

  topic_arn = aws_sns_topic.error_global.arn
  protocol  = "email"
  endpoint  = "46ki75@gmail.com"
}
