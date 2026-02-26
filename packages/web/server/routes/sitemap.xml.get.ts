import { SitemapStream, streamToPromise } from "sitemap";
import type { Readable } from "node:stream";

export type UrlEntry = {
  url: string; // absolute URL or path
  lastmod?: string; // YYYY-MM-DD
  changefreq?: "daily" | "weekly" | "monthly" | string;
  priority?: number;
};

const normalizeBase = (endpoint: string) => endpoint.replace(/\/+$/g, "");

export const generateSitemap = async (): Promise<string> => {
  console.log("🔧 Generating pages sitemap (sitemap package)");

  const appConfig = useAppConfig();

  const base = normalizeBase(appConfig.ENDPOINT);

  // Static routes (pages). Keep paths relative so hostname option is used below.
  const paths: UrlEntry[] = [
    { url: "/", lastmod: undefined, changefreq: "monthly", priority: 0.9 },
    { url: "/about", lastmod: undefined, changefreq: "yearly", priority: 0.3 },
    { url: "/blog", lastmod: undefined, changefreq: "daily", priority: 0.6 },
    {
      url: "/image-converter",
      lastmod: undefined,
      changefreq: "monthly",
      priority: 0.4,
    },
    {
      url: "/privacy",
      lastmod: undefined,
      changefreq: "yearly",
      priority: 0.2,
    },
  ];

  // Prevent accidental self-reference or index references
  const prohibited = new Set([
    "/sitemap.xml",
    "/sitemap-index.xml",
    "/sitemap.xml.gz",
  ]);
  const filtered = paths.filter((p) => !prohibited.has(p.url));

  const smStream = new SitemapStream({ hostname: base });

  for (const p of filtered) {
    // write accepts objects with url, lastmod, changefreq, priority
    smStream.write({
      url: p.url,
      lastmod: p.lastmod,
      changefreq: p.changefreq,
      priority: p.priority,
    });
  }

  smStream.end();

  const buffer = await streamToPromise(smStream as unknown as Readable);
  const xml = buffer.toString();

  return xml.endsWith("\n") ? xml : xml + "\n";
};

export default defineEventHandler(async (event) => {
  setHeader(event, "content-type", "application/xml");
  return await generateSitemap();
});
