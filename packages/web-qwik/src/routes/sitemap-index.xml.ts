import { SitemapIndexStream, streamToPromise } from "sitemap";

import { siteOrigin } from "~/utils/site";

export async function GET() {
  const stream = new SitemapIndexStream();
  stream.write({ url: `${siteOrigin}/sitemap.xml` });
  stream.write({ url: `${siteOrigin}/cache/v3/blog/sitemap.xml` });
  stream.end();
  const xml = await streamToPromise(stream);

  return new Response(xml.toString(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
