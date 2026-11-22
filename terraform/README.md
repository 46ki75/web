# Terraform

## AWS blog snapshots

Generate a candidate with the [TypeScript publisher](../packages/blog-publisher/README.md).
Use the stage's public website origin when generating it. Notion credentials are
only passed to the generator; the following commands need AWS credentials but
not a Notion token.

```sh
export AWS_PROFILE=46ki75-web
export STAGE_NAME=dev
previous=$(node packages/aws-release/src/publish-blog.ts --stage "$STAGE_NAME" active)
node packages/aws-release/src/publish-blog.ts --stage "$STAGE_NAME" upload --directory "$work/snapshot"
# Use the release ID printed by upload. The initial active ID is legacy.
node packages/aws-release/src/publish-blog.ts --stage "$STAGE_NAME" activate NEW_ID --expect "$previous"
```

Upload validates the complete snapshot, stores immutable objects in the
existing private blog bucket, and marks the release ready. Activation changes
one CloudFront key. The public `/cache/v3/blog/*` URLs stay the same. Shared
image keys are content-addressed; v2 cache objects and old image URLs are kept.
Do not run simultaneous uploads for the same stage. Do not delete releases or
shared images needed for rollback.

CloudFront propagates changes asynchronously. Verify both indices, localized
article JSON, images, and feeds match the candidate before rebuilding and
deploying the website from the stage's public snapshots. To roll
back, run `activate PREVIOUS_ID --expect NEW_ID`; `legacy` selects the last
Rust-generated snapshot without running Rust. Website release rollback is
separate.

## AWS static frontend

The private `web` bucket serves the site through CloudFront. `/cache/*` has a
separate private S3 origin. A CloudFront Function handles directory indexes,
permanent redirects, and the website's `404.html`. Dev and staging keep Basic
authentication on the site. Retired `/api/*` paths are handled like any other
missing website path.

From the repository root, with the web account AWS profile set, deploy one
stage at a time (`dev`, `stg`, or `prod`). Both release commands use the
workspace's Node.js and AWS CLI versions. On a fresh checkout, run
`mise run setup:node` first.

```sh
export AWS_PROFILE=46ki75-web
export AWS_REGION=ap-northeast-1
export STAGE_NAME=dev
previous=$(node packages/aws-release/src/deploy-static.ts --stage "$STAGE_NAME" active)
mise run //packages/web-solid:build &&
  node packages/aws-release/src/deploy-static.ts --stage "$STAGE_NAME" upload
# Use the website release ID printed by upload, not the blog release ID.
node packages/aws-release/src/deploy-static.ts --stage "$STAGE_NAME" activate RELEASE_ID --expect "$previous"
```

The uploader accepts only the static client artifact and checks its canonical
host. It keeps the existing `/build/` assets for cached pages and rollback,
uploads the rest under `site-releases/`, and writes public route entries to the
stage's existing CloudFront key-value store. It leaves the publisher's cache
and the auth entries alone. Activation changes the release pointer only. Do
not run simultaneous uploads for the same stage or delete a release still used
for rollback. If pruning old releases, remove their S3 prefixes and associated
`static:<release>:` KVS keys together. Use regional STS credentials for KVS.

All three stages use the static origin. For a new distribution, apply Terraform
for that workspace, then prepare and activate its first release. After an
activation, check localized pages, immutable assets, redirects with query
strings, and HTTP 404s. Verify `/cache/v3/blog/list/en.json` remains reachable
and non-production site pages require valid Basic credentials. When editing
the edge function, test its `DEVELOPMENT` stage with CloudFront `TestFunction`:
CloudFront's JavaScript runtime supports less syntax than Node.js.

To roll back, run `activate PREVIOUS_ID --expect CURRENT_ID` with the same
stage. The old Nitro origin is no longer available as a rollback target.

Run `mise run //packages/aws-release:check` to test both release commands
without writing to AWS.

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
