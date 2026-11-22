# CDN path design

All traffic is served by a single CloudFront distribution. The request path
prefix selects the S3 origin. The static website and the blog publisher's
snapshot files are served from separate buckets.

## Origin routing

CloudFront behaviors are matched in order; the first matching path pattern wins.

| Path pattern | Origin          | Backend                          | Cache policy | Basic auth\* |
| ------------ | --------------- | -------------------------------- | ------------ | ------------ |
| `/cache/*`   | `s3-blog`       | S3 — blog cache bucket           | `s3`         | no           |
| `/build/*`   | `s3-web`        | S3 — hashed frontend assets     | `s3`         | yes          |
| _(default)_  | `s3-web`        | S3 — static site releases       | `static_site` | yes         |

\* Basic auth is enforced on website pages and assets in `dev` and `stg`,
including missing routes; `/cache/*` remains publicly readable through CloudFront.

The default behavior serves a static S3 release selected by the CloudFront
Function. For deployment and release rollback, see the
[AWS static frontend runbook](../terraform/README.md#aws-static-frontend).

The retired `/api/*` namespace falls through to the website's 404 handling.
`/cache/*` uses a separate CloudFront Function to select the active blog
release in `s3-blog`. Neither behavior invokes a Lambda.

## Blog cache key layout

The TypeScript blog publisher renders the current Notion state into a complete
snapshot. [Publishing to AWS](../terraform/README.md#aws-blog-snapshots) stores
it in the existing private blog-cache bucket (`{stage}-46ki75-web-s3-bucket-blog-cache`).
The public paths stay the same:

```text
# collection-level
cache/v3/blog/list/{en|ja}.json                                    # index per language
cache/v3/blog/tags.json                                            # language-agnostic tag list
cache/v3/blog/feed/{rss|atom|json-feed}/{en|ja}.{xml|json}         # feeds
cache/v3/blog/sitemap.xml                                          # blog sitemap

# per-article (everything for one post under article/{slug}/)
cache/v3/blog/article/{slug}/contents/{en|ja}.json                 # rendered article (A2UI surface)
cache/v3/blog/article/{slug}/og-image/{en|ja}                      # OGP cover (WebP, 1200w)

# global, content-addressed (shared across releases and articles)
cache/v3/blog/block-image/{sha256}/{default|small|medium|large}    # images and tag icons
```

Notes:

- The language is baked into the **path**, not an `Accept-Language` header or a
  `?lang=` query — every object is independently cacheable.
- Rendered article JSON embeds image `src`/`srcset` as `/cache/v3/blog/block-image/{id}/{size}`,
  so the browser fetches them directly from the static origin.
- Images are materialized as WebP. Up to four variants are generated, depending
  on source size. Legacy image URLs remain valid.

### Cache-Control

Set at publish time, passed through by the `s3` cache policy:

| Objects                                             | `Cache-Control`                                                                                 |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| indices, contents, tags, feeds, sitemap, OGP covers | `public, max-age=0, s-maxage=31536000` (browser revalidates)                                   |
| block images                                        | `public, max-age=31536000, immutable`                                                          |

The CloudFront Function rewrites snapshot requests to
`blog-releases/<release>/cache/v3/blog/...`, including the release ID in the
cache key. Changing releases does not require an invalidation. Requests for
block images, older cache versions, or the `legacy` snapshot keep the original
S3 object path. The legacy Rust manifest stays private and is not used.

## Snapshot contract

The frontend build downloads the published `/cache/v3/blog/*` files. For
interactive site features the browser reads the bundled copy. Public feed URLs
are still served through CloudFront. The generator and frontend share the
[TypeScript snapshot contract](../packages/blog-snapshot/index.ts).
