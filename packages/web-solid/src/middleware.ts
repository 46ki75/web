import type { StartMiddleware } from "@solidjs/vite-plugin";

import { removeLocalePrefix } from "~/i18n/locale";

// Used by Vite dev and by the prerenderer to generate legacy redirect pages.
const middleware: StartMiddleware = (event, next) => {
  const { request } = event;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return next();
  }

  const { pathname, search } = new URL(request.url);
  let location: string | undefined;
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    location = removeLocalePrefix(pathname);
  } else if (pathname === "/about" || pathname === "/about/") {
    location = "/";
  } else if (pathname === "/ja/about" || pathname === "/ja/about/") {
    location = "/ja/";
  }

  return location
    ? new Response(null, {
        status: 308,
        headers: { Location: location + search },
      })
    : next();
};

export default middleware;
