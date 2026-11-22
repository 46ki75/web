import type { StartMiddleware } from "@solidjs/vite-plugin";
import { createAPIHandler } from "filesystem-routing/api";
import routes from "virtual:file-routes";

import { removeLocalePrefix } from "~/i18n/locale";

const handleApi = createAPIHandler(routes);

const middleware: StartMiddleware = async (event, next) => {
  const { request } = event;
  const { pathname, search } = new URL(request.url);
  const canRedirect = request.method === "GET" || request.method === "HEAD";

  let location: string | undefined;
  if (canRedirect) {
    if (pathname === "/en" || pathname.startsWith("/en/")) {
      location = removeLocalePrefix(pathname);
    } else if (pathname === "/about" || pathname === "/about/") {
      location = "/";
    } else if (pathname === "/ja/about" || pathname === "/ja/about/") {
      location = "/ja/";
    }
  }

  const response = location
    ? new Response(null, {
        status: 308,
        headers: { Location: location + search },
      })
    : await handleApi(event, next);

  response.headers.set("X-Content-Type-Options", "nosniff");
  if (response.status >= 400) {
    response.headers.set("Cache-Control", "no-store");
  } else if (
    response.ok &&
    request.method === "GET" &&
    request.headers.get("accept")?.includes("text/html") &&
    response.headers.get("content-type")?.includes("text/html") &&
    !pathname.includes(".")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=600, s-maxage=31536000",
    );
  }

  return response;
};

export default middleware;
