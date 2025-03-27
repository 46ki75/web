## Manually Managed Resources

## S3 Bucket

- `shared-46ki75-web-s3-bucket-terraform-tfstate`: Used to manage Terraform state (tfstate) files.

## Systems Manager Parameter Store

- `/${STAGE_NAME}/46ki75/web/ssm/parameter/notion/secret`
- `/shared/46ki75/web/ssm/parameter/notion/database/id`

## Route53 Zones

- `dev-www.46ki75.com`
- `stg-www.46ki75.com`
- `www.46ki75.com`

## Route53 Record (external account)

Please add the following records to the parent hosted zone:

- `dev-www.46ki75.com` NS
- `stg-www.46ki75.com` NS
- `www.46ki75.com` NS

## Domain Design

### CloudFront (Main Domain)

- `dev-internal.46ki75.com`: CloudFront for the development environment
- `stg-internal.46ki75.com`: CloudFront for the staging environment
- `internal.46ki75.com`: CloudFront for the production environment

### Amazon API Gateway

- `api.dev-internal.46ki75.com`: Development environment
- `api.stg-internal.46ki75.com`: Staging environment
- `api.internal.46ki75.com`: Production environment
