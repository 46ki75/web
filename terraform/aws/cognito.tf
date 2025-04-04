resource "aws_cognito_identity_pool" "rum" {
  identity_pool_name               = "${terraform.workspace}-46ki75-web-cognito-id_pool-rum"
  allow_unauthenticated_identities = true
}

resource "aws_iam_role" "unauth" {
  name = "${terraform.workspace}-46ki75-web-iam-role-rum"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        },
        Action = "sts:AssumeRoleWithWebIdentity",
        Condition = {
          "StringEquals" = {
            "cognito-identity.amazonaws.com:aud" = "${aws_cognito_identity_pool.rum.id}"
          },
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "unauthenticated"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "unauth_policy" {
  role = aws_iam_role.unauth.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = "rum:PutRumEvents",
        Resource = "arn:aws:rum:ap-northeast-1:${data.aws_caller_identity.current.account_id}:appmonitor/*"
      }
    ]
  })
}

resource "aws_cognito_identity_pool_roles_attachment" "rum" {
  identity_pool_id = aws_cognito_identity_pool.rum.id

  roles = {
    unauthenticated = aws_iam_role.unauth.arn
  }
}

