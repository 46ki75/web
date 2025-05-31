# Terraform

## Manually Managed Resources

## S3 Bucket

- `shared-46ki75-web-s3-bucket-terraform-tfstate`: Used to manage Terraform state (tfstate) files.

## Systems Manager Parameter Store

- `/${STAGE_NAME}/46ki75/web/ssm/parameter/notion/secret`
- `/shared/46ki75/web/ssm/parameter/notion/database/id`

## Route53 Zones

- `dev-www.ikuma.cloud`
- `stg-www.ikuma.cloud`
- `www.ikuma.cloud`

## Route53 Record (external account)

Please add the following records to the parent hosted zone:

- `dev-www.ikuma.cloud` NS
- `stg-www.ikuma.cloud` NS
- `www.ikuma.cloud` NS

## CloudFront Functions KVS

- dev | stg : `$.key`: shirayuki, `$.value`: password
- dev | stg : `$.key`: postman, `$.value`: password

## Domain Design

### CloudFront (Main Domain)

- `dev-internal.ikuma.cloud`: CloudFront for the development environment
- `stg-internal.ikuma.cloud`: CloudFront for the staging environment
- `internal.ikuma.cloud`: CloudFront for the production environment

### Amazon API Gateway

- `api.dev-internal.ikuma.cloud`: Development environment
- `api.stg-internal.ikuma.cloud`: Staging environment
- `api.internal.ikuma.cloud`: Production environment

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

| Stream Name     | Stream URL                    | Stream ID   | Measurement Id |
| --------------- | ----------------------------- | ----------- | -------------- |
| dev-46ki75-web  | <https://dev-www.ikuma.cloud> | 10456169337 | G-85QSG3WH5F   |
| stg-46ki75-web  | <https://stg-www.ikuma.cloud> | 10456381027 | G-Q7K53RM4VC   |
| prod-46ki75-web | <https://www.ikuma.cloud>     | 10456452308 | G-TW1BVM24YT   |
