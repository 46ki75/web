import cf from "cloudfront";

const kvs = cf.kvs();
const requireAuth = ${require_auth};

async function authorized(request) {
  const authorization = request.headers.authorization;
  const header = authorization && authorization.value;
  if (!header || !/^Basic /i.test(header)) return false;

  const credentials = Buffer.from(header.slice(6), "base64").toString("utf8");
  const colon = credentials.indexOf(":");
  if (colon <= 0 || colon === credentials.length - 1) return false;

  try {
    const password = await kvs.get(credentials.slice(0, colon));
    return password === credentials.slice(colon + 1);
  } catch (_) {
    return false;
  }
}

function querySuffix(query) {
  const params = [];
  Object.keys(query).forEach(function (name) {
    const items = query[name].multiValue || [query[name]];
    items.forEach(function (item) {
      params.push(name + "=" + item.value);
    });
  });
  return params.length ? "?" + params.join("&") : "";
}

async function serveStatic(request) {
  const uri = request.uri.replace(/\/$/, "") || "/";
  // The release prefix keeps new deployments from reusing stale cache entries.
  const release = await kvs.get("static:active");
  const prefix = "static:" + release + ":";
  const key = prefix + uri;
  if (Buffer.byteLength(key) <= 512 && (await kvs.exists(key))) {
    const target = await kvs.get(key);
    if (target.startsWith("!")) {
      return {
        statusCode: 308,
        headers: {
          location: { value: target.slice(1) + querySuffix(request.querystring) },
        },
      };
    }
    request.uri = "/site-releases/" + release + target;
    return request;
  }

  // Distribution-wide custom error responses would also mask API errors.
  const response = {
    statusCode: 404,
    headers: {
      "content-type": { value: "text/html; charset=utf-8" },
      "cache-control": { value: "no-store" },
    },
  };
  if (request.method !== "HEAD") response.body = await kvs.get(prefix + "404");
  return response;
}

async function handler(event) {
  const request = event.request;
  if (requireAuth && !(await authorized(request))) {
    return {
      statusCode: 401,
      headers: {
        "www-authenticate": { value: 'Basic realm="Restricted"' },
        "cache-control": { value: "no-store" },
      },
    };
  }

  // Keep existing Nitro assets reachable during the rollback window.
  if (request.uri.startsWith("/build/")) return request;

  // A transient key-value store error must not become a cacheable 404.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await serveStatic(request);
    } catch (_) {
      // Retry once before returning a temporary error.
    }
  }
  console.log("Static release lookup failed after retry");
  return {
    statusCode: 503,
    headers: { "cache-control": { value: "no-store" } },
  };
}
