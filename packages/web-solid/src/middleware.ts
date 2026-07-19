import { createMiddleware } from "@solidjs/start/middleware";

import { removeLocalePrefix } from "~/i18n/locale";

export default createMiddleware({
  onRequest(event) {
    const request = new URL(event.request.url);
    const canRedirect =
      event.request.method === "GET" || event.request.method === "HEAD";

    if (
      canRedirect &&
      (request.pathname === "/en" || request.pathname.startsWith("/en/"))
    ) {
      return new Response(null, {
        status: 308,
        headers: {
          Location: `${removeLocalePrefix(request.pathname)}${request.search}`,
        },
      });
    }

    if (
      canRedirect &&
      (request.pathname === "/about" || request.pathname === "/about/")
    ) {
      return new Response(null, {
        status: 308,
        headers: { Location: `/${request.search}` },
      });
    }

    if (
      canRedirect &&
      (request.pathname === "/ja/about" || request.pathname === "/ja/about/")
    ) {
      return new Response(null, {
        status: 308,
        headers: { Location: `/ja/${request.search}` },
      });
    }

    const acceptsHtml = event.request.headers
      .get("accept")
      ?.includes("text/html");

    if (
      event.request.method === "GET" &&
      acceptsHtml &&
      !request.pathname.includes(".")
    ) {
      event.response.headers.set(
        "Cache-Control",
        "public, max-age=600, s-maxage=31536000",
      );
    }
  },
  onBeforeResponse(event) {
    if ((event.response.status ?? 200) >= 400) {
      event.response.headers.set("Cache-Control", "no-store");
    }
    event.response.headers.set("X-Content-Type-Options", "nosniff");
  },
});
