import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import { ENDPOINT } from "./fetchConfig";

export const generateSitemap = async (routes: string[]) => {
  console.log("🗺️", "Generating sitemap.xml ...");

  const sitemap = new SitemapStream({ hostname: ENDPOINT });
  const writeStream = createWriteStream("./public/sitemap.xml");

  sitemap.pipe(writeStream);

  for (const route of routes) {
    sitemap.write({ url: route, changefreq: "weekly" });
  }

  sitemap.end();

  await streamToPromise(sitemap);

  console.log("🗺️", "Generating sitemap.xml ... Done!");
};
