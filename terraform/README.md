# Terraform

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

## CloudFront Functions KVS

- dev | stg : `$.key`: shirayuki, `$.value`: password
- dev | stg : `$.key`: postman, `$.value`: password

## Domain Design

### CloudFront (Main Domain)

- `dev-internal.46ki75.com`: CloudFront for the development environment
- `stg-internal.46ki75.com`: CloudFront for the staging environment
- `internal.46ki75.com`: CloudFront for the production environment

### Amazon API Gateway

- `api.dev-internal.46ki75.com`: Development environment
- `api.stg-internal.46ki75.com`: Staging environment
- `api.internal.46ki75.com`: Production environment

## Google Analytics

- [Google Analytics](https://analytics.google.com/analytics/web)

### Properties

- dev-46ki75-web
- stg-46ki75-web
- prod-46ki75-web

#### Common Settings

- Industry category: **Online Communities**
- Reporting time zone: **JST (GMT+09:00)**
- Currency displayed as: **JPY**

### Data Streams

| Stream Name     | Stream URL                   | Stream ID   | Measurement Id |
| --------------- | ---------------------------- | ----------- | -------------- |
| dev-46ki75-web  | <https://dev-www.46ki75.com> | 10456169337 | G-85QSG3WH5F   |
| stg-46ki75-web  | <https://stg-www.46ki75.com> | 10456381027 | G-Q7K53RM4VC   |
| prod-46ki75-web | <https://www.46ki75.com>     | 10456452308 | G-TW1BVM24YT   |
