import { siteOrigin } from "~/utils/site";

export function GET() {
  const content = [
    "User-agent: *",
    "Disallow:",
    "",
    `Sitemap: ${siteOrigin}/sitemap-index.xml`,
    "",
  ].join("\n");

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
