# TypeScript blog publisher

Generate a local replacement for the Rust publisher's `/cache/v3/blog/*`
snapshots. The TypeScript job uses the official Notion SDK and `n2a2ui`; it
has no AWS dependency and does not upload or activate anything. The deployed
Rust publisher remains in service until a separate, verified cutover.

## Generate and preview

From the repository root, install the locked dependencies with
`mise run setup:node`. Provide these environment variables from your secret
store:

- `NOTION_TOKEN`
- `NOTION_ARTICLE_DATA_SOURCE_ID`
- `NOTION_TAG_DATA_SOURCE_ID`

The existing wrapper can inject all three directly into a child process:

```sh
work=$(mktemp -d)
AWS_PROFILE=46ki75-web STAGE_NAME=dev ./scripts/with-notion-ssm.sh \
  node packages/blog-publisher/src/cli.ts snapshot \
  --output "$work/snapshot" --site-origin https://dev-www.ikuma.cloud
node packages/blog-publisher/src/cli.ts serve --directory "$work/snapshot"
```

The output directory must not exist. It is made visible only when the whole
snapshot succeeds. The preview server binds to `127.0.0.1:4174` by default
and supplies the MIME types needed for the extensionless WebP keys. It does
not need credentials. From a separate terminal, build the frontend against
this preview:

```sh
VITE_SITE_URL=https://dev-www.ikuma.cloud \
  BLOG_SNAPSHOT_ORIGIN=http://127.0.0.1:4174 \
  mise run //packages/web-solid:build
```

Keep the token out of dotenv files, logs, and build/deployment steps. This job
shares the [snapshot contract](../blog-snapshot/index.ts) with the frontend.
It uses the manual Notion `created_at` and `updated_at` fields, keeps the same
English and Japanese article and feed paths, and writes a full snapshot on
each run. It does not change the existing Rust publisher's incremental manifest.

## Media

Notion image URLs can expire. The job converts block images, callout icons,
tag icons, and covers to WebP and stores them in the snapshot. Inline assets
use content-derived keys so a regenerated image never overwrites a cached
one. Downloads require HTTPS and an exact allowed host, including on
redirects. Use `--media-host HOST` only for an explicitly trusted public
image host. A missing cover, unsuccessful image conversion, or hosted
file/audio/video attachment without a durable copy fails the run instead
of leaving an expiring URL in the snapshot.

## Validation and cutover

Run `mise run //packages/blog-publisher:check` for fixture tests, formatting,
and type checking. Before a live cutover, compare both lists and sets of
published slugs against the corresponding stage's Rust snapshots. Check
article metadata, rendered A2UI content, image variants, and feed entry IDs;
article component IDs and encoded image bytes need not match. Build and open
the portable site from the candidate before activating it.

Do not upload candidate files over a live snapshot by hand. Keep the Rust
publisher and its credentials until the replacement has a staged activation
and rollback procedure, has published successfully in all stages, and the
frontend has rebuilt from its output.
