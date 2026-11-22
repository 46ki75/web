# Blog publisher

This Rust package publishes Notion content as static blog snapshots under
`/cache/v3/blog/`. The package retains its historical `web-lambda-http-api`
name; the only executable is `web-lambda-blog-publisher`.

From the repository root, run `mise run //crates/web-lambda-http-api:check`
to test it and `mise run //crates/web-lambda-http-api:build` to build the ARM64
Lambda artifact. To update an existing publisher Lambda, use
`mise run //crates/web-lambda-http-api:deploy-publisher <stage>`.

## Notion publisher configuration

The publisher accepts Notion configuration through these environment variables:

| Variable | Value |
| --- | --- |
| `NOTION_TOKEN` | Notion integration token |
| `NOTION_ARTICLE_DATA_SOURCE_ID` | Article master data source ID |
| `NOTION_TAG_DATA_SOURCE_ID` | Blog tag data source ID |

Inject all three from your secret store. The publisher's Notion repository does
not fetch them itself. If you still use AWS Systems Manager Parameter Store,
[`scripts/with-notion-ssm.sh`](../../scripts/with-notion-ssm.sh) reads the three
parameters for `STAGE_NAME` (`dev`, `stg`, or `prod`) and passes them only to the
command it runs. Its AWS region defaults to `ap-northeast-1`.

To run the existing publisher once outside Lambda, from the repository root:

```sh
cargo build --locked -p web-lambda-http-api --bin web-lambda-blog-publisher
STAGE_NAME=dev CLOUDFRONT_DISTRIBUTION_ID=YOUR_DEV_DISTRIBUTION_ID \
  ./scripts/with-notion-ssm.sh ./target/debug/web-lambda-blog-publisher --once
```

If your runner already injects the three variables, omit the wrapper. `--once`
never falls back to SSM. It still writes to the stage's S3 bucket and invalidates
CloudFront when content changes; it is not a dry run. The deployed Lambda still
uses its existing SSM lookup if none of the variables are set. Partial settings
are rejected instead of mixing environment and SSM values.

On GitHub Actions, authenticate the SSM wrapper with a short-lived
[OIDC role](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
scoped to `ssm:GetParameter` on the three exact parameter ARNs for that stage,
plus `kms:Decrypt` on the key if the token uses a customer-managed key. The
legacy `--once` publisher also needs its existing S3 and CloudFront permissions.
Run the wrapper and publisher in one trusted step. Do not print the token or
persist it to `$GITHUB_ENV`, a dotenv file, or a `VITE_` variable. The static
frontend build reads public snapshots and needs none of these credentials.
