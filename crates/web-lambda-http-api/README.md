# Introduction

http-api-v2 is a Rust project that implements an AWS Lambda function in Rust.

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Cargo Lambda](https://www.cargo-lambda.info/guide/installation.html)

## Building

To build the project for production, run `cargo lambda build --release`. Remove the `--release` flag to build for development.

Read more about building your lambda function in [the Cargo Lambda documentation](https://www.cargo-lambda.info/commands/build.html).

## Testing

You can run regular Rust unit tests with `cargo test`.

If you want to run integration tests locally, you can use the `cargo lambda watch` and `cargo lambda invoke` commands to do it.

First, run `cargo lambda watch` to start a local server. When you make changes to the code, the server will automatically restart.

Second, you'll need a way to pass the event data to the lambda function.

You can use the existent [event payloads](https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/lambda-events/src/fixtures) in the Rust Runtime repository if your lambda function is using one of the supported event types.

You can use those examples directly with the `--data-example` flag, where the value is the name of the file in the [lambda-events](https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/lambda-events/src/fixtures) repository without the `example_` prefix and the `.json` extension.

```bash
cargo lambda invoke --data-example apigw-request
```

For generic events, where you define the event data structure, you can create a JSON file with the data you want to test with. For example:

```json
{
    "command": "test"
}
```

Then, run `cargo lambda invoke --data-file ./data.json` to invoke the function with the data in `data.json`.

For HTTP events, you can also call the function directly with cURL or any other HTTP client. For example:

```bash
curl https://localhost:9000
```

Read more about running the local server in [the Cargo Lambda documentation for the `watch` command](https://www.cargo-lambda.info/commands/watch.html).
Read more about invoking the function in [the Cargo Lambda documentation for the `invoke` command](https://www.cargo-lambda.info/commands/invoke.html).

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

## Deploying

To deploy the project, run `cargo lambda deploy`. This will create an IAM role and a Lambda function in your AWS account.

Read more about deploying your lambda function in [the Cargo Lambda documentation](https://www.cargo-lambda.info/commands/deploy.html).
