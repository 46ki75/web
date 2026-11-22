# FineNight web

The SolidJS frontend generates HTML for English and Japanese pages, including
all published blog articles. The browser hydrates the HTML for theme switching,
locale navigation, and blog search.

## Build and preview

From the repository root:

```sh
pnpm install --frozen-lockfile
mise run //packages/web-solid:build
python3 -m http.server 4173 --directory packages/web-solid/dist/client
```

For a local preview with the site's 404 page, use `pnpm --filter web-solid start`
instead of the Python server. For development, run `mise run //packages/web-solid:dev`.
Vite takes a fresh content snapshot on startup. `mise run //packages/web-solid:check` runs format,
lint, type, and test checks. The integration tests build from local fixtures, so
CI does not depend on the live blog or Credly.

## Build-time configuration

The build downloads the public blog cache and Credly badges. It bundles JSON,
article and badge images, RSS/Atom/JSON feeds, `robots.txt`, and sitemaps. Builds
fail if required published content is unavailable. Rebuild and redeploy after
the existing Rust publisher updates the cache. The frontend build needs no
Notion or SSM credentials. See the [publisher configuration](../../crates/web-lambda-http-api/README.md#notion-publisher-configuration)
for how to supply them to the publisher.

Set these variables in the shell/CI or in a Vite `.env.<mode>` file in this
package. The default build mode is `production`; `STAGE_NAME` does not select a
Vite mode.

| Variable               | Purpose                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `STAGE_NAME`           | Defaults to `prod`; selects the default blog and site origins (`www.ikuma.cloud`, `stg-www.ikuma.cloud`, or `dev-www.ikuma.cloud`). |
| `VITE_SITE_URL`        | Public site origin for canonical links, social metadata, feeds, and sitemaps. Set this if deploying to a different hostname.        |
| `BLOG_SNAPSHOT_ORIGIN` | Origin serving the published `/cache/v3/blog/*` files. Override it to build against a mirror or another stage.                      |
| `CREDLY_SNAPSHOT_URL`  | Optional override for the Credly badge JSON source.                                                                                 |

## Deploy

Publish **only `packages/web-solid/dist/client/`** at the root of a static
host. `dist/server/` is a build-time renderer, not part of the deployment.
Configure directory indexes so `/ja/blog/article/example` resolves to
`/ja/blog/article/example/index.html`. Serve `404.html` with HTTP 404 for
missing paths; do not configure an SPA fallback. Keep hashed `/build/` and
`/content/media/` assets cacheable, and revalidate HTML and non-hashed content
files on deployment.

Known legacy `/en/*`, `/about`, and `/ja/about` paths have static redirect
pages. If the host supports redirects, prefer permanent HTTP redirects that
preserve the query string. Use host configuration for response headers and
any staging access restrictions.

The old frontend Lambda deployment command is retired. The existing AWS
Terraform distribution still points at the old frontend Lambda; it is not
changed by this build. For an AWS cutover, publish to a static origin, validate
routes and 404s, and switch the website origin separately. Leave the publisher,
its `/cache/*` origin, and the Rust `/api/*` routes in place for existing
consumers until they are migrated or confirmed unused.
