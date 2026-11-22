import cf from "cloudfront";

const store = cf.kvs();
const activeKey = "blog:active";

async function handler(event) {
  const request = event.request;
  // CloudFront normalizes paths to select the behavior, but the origin gets the
  // raw URI. Do not let an encoded separator or a dot segment escape the prefix.
  let path;
  try {
    path = request.uri.split("/").map(function (part) {
      const decoded = decodeURIComponent(part);
      if (decoded === "." || decoded === ".." || /[\/\\\x00-\x1f\x7f]/.test(decoded)) {
        throw new Error("Invalid cache path segment");
      }
      return decoded;
    }).join("/");
  } catch (_) {
    return {statusCode: 404, headers: {"cache-control": {value: "no-store"}}};
  }
  if (!path.startsWith("/cache/")) {
    return {statusCode: 404, headers: {"cache-control": {value: "no-store"}}};
  }
  // Leave other cache versions and stable image objects at their existing keys.
  if (!path.startsWith("/cache/v3/blog/") || path.startsWith("/cache/v3/blog/block-image/")) {
    return request;
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (!(await store.exists(activeKey))) return request;
      const release = await store.get(activeKey);
      if (release === "legacy") return request;
      if (/^[0-9a-f]{24}$/.test(release)) {
        request.uri = "/blog-releases/" + release + request.uri;
        return request;
      }
    } catch (_) {
      // Don't serve a stale legacy snapshot when the key store fails.
    }
  }
  return {statusCode: 503, headers: {"cache-control": {value: "no-store"}}};
}
