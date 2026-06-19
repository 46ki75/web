# CDN path design

All traffic is served by a single CloudFront distribution. The request path
prefix selects the origin, so each prefix maps to exactly one backend. Keeping
the prefixes disjoint makes it obvious — from a URL alone — whether a response
is dynamic (Lambda) or a pre-rendered static object (S3).

## Origin routing

CloudFront behaviors are matched in order; the first matching path pattern wins.

| Path pattern                                                                               | Origin          | Backend                        | Cache policy | Basic auth\* |
| ------------------------------------------------------------------------------------------ | --------------- | ------------------------------ | ------------ | ------------ |
| `/api/*`                                                                                   | `api-backend`   | Lambda — `web-lambda-http-api` | `http_api`   | no           |
| `/cache/*`                                                                                 | `s3-blog`       | S3 — blog cache bucket         | `s3`         | no           |
| `/static/*`, `/assets/*`, `/build/*`, `/favicon.ico`, `/manifest.json`, `/q-manifest.json` | `s3-web`        | S3 — frontend assets           | `s3`         | yes          |
| _(default)_                                                                                | `nitro-backend` | Lambda — Qwik SSR (nitro)      | `nitro`      | yes          |

\* Basic auth is a CloudFront viewer-request function applied only to the HTML
and frontend-asset behaviors on non-`prod` stages. `/api/*` and `/cache/*` are
not behind it.

The two rules that matter:

- **`/api/*` is the Lambda HTTP API.** Dynamic responses, `http_api` cache
  policy (varies on `Accept-Language`, short TTL).
- **`/cache/*` is the S3 static blog cache.** The whole `/cache/*` namespace is
  reserved for the `s3-blog` origin. Public URLs map 1:1 to S3 object keys, so
  the CDN serves them straight from S3 with no Lambda hop.

## Blog cache key layout

The `blog_publisher` Lambda renders the current Notion state into static objects
in the blog-cache bucket (`{stage}-46ki75-web-s3-bucket-blog-cache`). Object
keys mirror the public `/cache/v2/blog/...` URLs exactly:

```text
# collection-level
cache/v2/blog/list/{en|ja}.json                                    # index per language
cache/v2/blog/tags.json                                            # language-agnostic tag list
cache/v2/blog/feed/{rss|atom|json-feed}/{en|ja}.{xml|json}         # feeds
cache/v2/blog/sitemap.xml                                          # blog sitemap

# per-article (everything for one post under article/{slug}/)
cache/v2/blog/article/{slug}/contents/{en|ja}.json                 # rendered article (jarkup)
cache/v2/blog/article/{slug}/og-image/{en|ja}                      # OGP cover (WebP, 1200w)

# global, content-addressed (block ids are unique; shared across articles)
cache/v2/blog/block-image/{block_id}/{default|small|medium|large}  # in-article images
```

Notes:

- The language is baked into the **path**, not an `Accept-Language` header or a
  `?lang=` query — every object is independently cacheable.
- Rendered article JSON embeds image `src`/`srcset` as `/cache/v2/blog/block-image/{id}/{size}`,
  so the browser fetches them directly from the static origin.
- Raster images expose `default|small|medium|large`; SVGs are
  resolution-independent and expose only `default`.

### Cache-Control

Set at publish time, passed through by the `s3` cache policy:

| Objects                                             | `Cache-Control`                                                                                 |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| indices, contents, tags, feeds, sitemap, OGP covers | `public, max-age=0, s-maxage=31536000` (browser revalidates; CDN holds, invalidated on publish) |
| block images                                        | `public, max-age=31536000, s-maxage=31536000, immutable`                                        |

Each publish issues a CloudFront invalidation for `/cache/v2/blog/*`.

## Lambda blog API (`/api/v2/blog/*`)

The Lambda still exposes the original header/query-based blog API under
`/api/v2/blog/*` (e.g. `GET /api/v2/blog` with `Accept-Language`). It is **not**
on the read path — the frontend reads `/cache/v2/blog/*` directly — but it is kept
because:

- it is the source of the OpenAPI spec the frontend generates TypeScript types
  from, and
- it serves as a fallback that reads the same materialized `cache/v2/blog/...`
  objects.

These contract paths are deliberately distinct from the `/cache/v2/blog/...` object
keys.
