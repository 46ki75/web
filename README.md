# Web

[www.ikuma.cloud](https://www.ikuma.cloud)

My personal website.

## Setup

Install [mise](https://mise.jdx.dev/installing-mise.html) 2026.9.9 or newer and
[rustup](https://rustup.rs/), then run:

```sh
mise trust mise.toml
mise install node pnpm awscli terraform zig cargo-lambda
mise run --silent setup
```

`mise.toml` owns exact development-tool versions; pnpm's exact version comes from
`package.json#packageManager`. Commit `mise.lock` and `.mise/locks/` sidecars when
updating tools. Locks cover macOS arm64 and Linux x64/arm64.
Rustup selects the toolchain, components, and Lambda target from
`rust-toolchain.toml`. Keep rustup's Cargo proxies on PATH and verify selection
with `mise exec -- rustup show active-toolchain`.

## Tasks

Each active package owns its tasks in a local `mise.toml`; the root tasks aggregate
the package task graph. Shell activation is optional. Use `mise tasks ls --all` to
list the complete catalog, or run `mise :<task>` from within a package directory.

| Command                                                   | Purpose                                                   |
| --------------------------------------------------------- | --------------------------------------------------------- |
| `mise run //packages/web-solid:dev`                       | Start the frontend                                        |
| `mise run //crates/web-lambda-http-api:dev [stage]`       | Watch the API on port 10000                               |
| `mise run //crates/web-lambda-http-api:build`             | Build arm64 API/publisher Lambdas                         |
| `mise run //crates/web-lambda-http-api:deploy <stage>`    | Build and deploy the API                                  |
| `mise run //crates/web-lambda-http-api:deploy-publisher <stage>` | Build and deploy the publisher                       |
| `mise run //crates/web-lambda-http-api:invoke-publisher <stage>` | Rebuild blogs; wait up to 15 minutes                 |
| `mise run //crates/web-lambda-logs-reporter:deploy <stage>`      | Build and deploy the reporter                        |
| `mise run //packages/web-solid:deploy <stage>`            | Build, upload, and invalidate the frontend                |
| `mise run --silent fmt` / `mise run --silent fmt-check`  | Format/check the same Rust, frontend, and Terraform scope |
| `mise run --silent check:quick`                           | Fast project-wide feedback                                |
| `mise run --silent check`                                 | Complete quality gate, including ordinary tests           |
| `mise run --silent test`                                  | Run all ordinary package test suites                      |

Rerun a failed local task without `--silent` for complete diagnostics. Stages are
`dev`, `stg`, or `prod`. Existing `.envrc` and AWS credential setup still apply to
commands requiring environment-specific configuration. The package-owned
`mise run --silent //crates/web-blog-sdk:test:live` task runs the Notion integration
tests, which require the credentials documented by those tests. They are excluded
from `test` and CI.

Archived `crates/http-api-old` tasks remain available under
`//crates/http-api-old:*`. Its manifest currently inherits removed dependencies
such as `jarkup-rs`, so those commands are blocked until that crate is restored.
It is excluded from the active workspace and root quality gates.

See the shared [mise standard](https://github.com/46ki75/engineering-standard/blob/main/skills/engineering-standard/references/mise/README.md).
