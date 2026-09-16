# Web

[www.ikuma.cloud](https://www.ikuma.cloud)

My personal website.

## Setup

Install [mise](https://mise.jdx.dev/installing-mise.html) 2026.9.9 or newer and
[rustup](https://rustup.rs/), then run:

```sh
mise trust mise.toml
mise install node pnpm awscli terraform zig cargo-lambda
mise run setup
```

`mise.toml` owns exact development-tool versions; pnpm's exact version comes from
`package.json#packageManager`. Commit `mise.lock` and `.mise/locks/` sidecars when
updating tools. Locks cover macOS arm64 and Linux x64/arm64.
Rustup selects the toolchain, components, and Lambda target from
`rust-toolchain.toml`. Keep rustup's Cargo proxies on PATH and verify selection
with `mise exec -- rustup show active-toolchain`.

## Tasks

Run tasks from the repository root or a subdirectory; shell activation is optional.
`mise tasks ls` lists the complete catalog. Repository rules here take precedence
over the older bundled development-standards skill's Just examples.

| Command                                      | Purpose                                                   |
| -------------------------------------------- | --------------------------------------------------------- |
| `mise run web:dev`                           | Start the frontend                                        |
| `mise run http-api:dev [dev\|stg\|prod]`     | Watch the API on port 10000                               |
| `mise run http-api:build`                    | Build arm64 API/publisher Lambdas                         |
| `mise run http-api:deploy <stage>`           | Build and deploy the API                                  |
| `mise run http-api:deploy-publisher <stage>` | Build and deploy the publisher                            |
| `mise run http-api:invoke-publisher <stage>` | Rebuild blogs; wait up to 15 minutes                      |
| `mise run logs-reporter:deploy <stage>`      | Build and deploy the reporter                             |
| `mise run web:deploy <stage>`                | Build, upload, and invalidate the frontend                |
| `mise run fmt` / `mise run fmt-check`        | Format/check the same Rust, frontend, and Terraform scope |
| `mise run check`                             | Project-wide formatting, lint, and type checks            |
| `mise run test`                              | Rust unit tests and frontend unit/SSR tests               |

Stages are `dev`, `stg`, or `prod`. Existing `.envrc` and AWS credential setup
still apply to commands requiring environment-specific configuration.
`mise run rust:test:live` explicitly runs the Notion integration tests, which need
the credentials documented by those tests. They are excluded from `test` and CI.

Archived `crates/http-api-old` recipes are retained as `legacy:http-api-old:*`.
Its manifest currently inherits removed dependencies such as `jarkup-rs`, so these
commands are blocked until that crate is restored. It is outside the active
workspace and ordinary validation.

See the shared [mise standard](https://github.com/46ki75/engineering-standard/blob/main/skills/engineering-standard/references/mise/README.md).
