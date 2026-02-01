import { SitemapIndexStream, streamToPromise } from "sitemap";
import type { Readable } from "node:stream";

export type SitemapEntry = {
  url: string; // absolute URL
  lastmod?: string; // YYYY-MM-DD
};

const normalizeBase = (endpoint: string) => endpoint.replace(/\/+$/g, "");

export const generateSitemapIndex = async (): Promise<string> => {
  console.log("🔧 Generating sitemap index (sitemap package)");

  const runtimeConfig = useRuntimeConfig();

  const base = normalizeBase(runtimeConfig.public.ENDPOINT);

  const entries: SitemapEntry[] = [
    { url: `${base}/sitemap.xml`, lastmod: undefined },
    { url: `${base}/api/v2/blog/sitemap.xml`, lastmod: undefined },
  ];

  // SitemapIndexStream expects either string URLs or objects with 'url' and optional 'lastmod'
  interface SitemapIndexWritable {
    write(chunk: { url: string; lastmod?: string } | string): boolean;
    end(): void;
  }

  const smStream = new SitemapIndexStream(
    {},
  ) as unknown as SitemapIndexWritable;

  for (const e of entries) {
    // Write as object so lastmod is included when supported
    smStream.write({ url: e.url, lastmod: e.lastmod });
  }

  smStream.end();

  const buffer = await streamToPromise(smStream as unknown as Readable);
  // streamToPromise returns a Buffer
  const xml = buffer.toString();

  return xml.endsWith("\n") ? xml : xml + "\n";
};

export default defineEventHandler(async (event) => {
  setHeader(event, "content-type", "application/xml");
  return await generateSitemapIndex();
});
