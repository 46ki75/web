# Terraform

## AWS static frontend

The existing private `web` bucket serves the site through CloudFront. `/api/*`
and `/cache/*` retain their own origins and error responses. A CloudFront
Function handles directory indexes, permanent redirects, and the website's
`404.html`. Dev and staging keep Basic authentication.

From the repository root, with the web account AWS profile set, deploy one
stage at a time (`dev`, `stg`, or `prod`):

```sh
export AWS_PROFILE=46ki75-web
export AWS_REGION=ap-northeast-1
export STAGE_NAME=dev
pnpm --filter web-solid build
python3 scripts/deploy-static-aws.py --stage "$STAGE_NAME" upload
# Use the release ID printed by upload:
python3 scripts/deploy-static-aws.py --stage "$STAGE_NAME" activate RELEASE_ID
```

The uploader accepts only the static client artifact and checks its canonical
host. It keeps the existing `/build/` assets for cached pages and rollback,
uploads the rest under `site-releases/`, and writes public route entries to the
stage's existing CloudFront key-value store. It leaves the publisher's cache
and the auth entries alone. Activation changes the release pointer only. Do
not run simultaneous uploads for the same stage or delete a release still used
for rollback. If pruning old releases, remove their S3 prefixes and associated
`static:<release>:` KVS keys together. Use regional STS credentials for KVS.

For the **first** cutover of a stage, prepare and activate a release before
adding the stage to [`aws/static-site.auto.tfvars`](aws/static-site.auto.tfvars).
With `TF_WORKSPACE` set to that stage, review and apply a saved Terraform plan.
The plan should only add the new website function and cache policy and update
the two website behaviors. After CloudFront deploys, verify the English and
Japanese home and article routes, immutable assets, redirects with query
strings, and an unknown URL returning HTTP 404. Check that `/api/health` and
`/cache/v3/blog/list/en.json` still respond, and that non-production requires
valid Basic credentials. Nitro remains deployed for rollback. When editing the
edge function, also test its `DEVELOPMENT` stage with CloudFront `TestFunction`:
CloudFront's JavaScript runtime supports less syntax than Node.js.

To roll back a content release, activate the prior prepared release ID. To
roll back the origin migration itself, remove the stage from
`aws/static-site.auto.tfvars` and review and apply the Terraform plan for that
workspace. This switches the website behaviors back without changing the API
or blog cache.

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
