import { SitemapStream, streamToPromise } from "sitemap";
import { fetchPrerenderRoutes } from "../../scripts/fetchRoutes";
import { ENDPOINT } from "../../scripts/fetchConfig";

export const generateSitemap = async (routes: string[]): Promise<string> => {
  console.log("🗺️", "Generating sitemap.xml ...");

  const sitemap = new SitemapStream({ hostname: ENDPOINT });

  for (const route of routes) {
    sitemap.write({ url: route, changefreq: "weekly" });
  }

  sitemap.end();

  const buffer = await streamToPromise(sitemap);
  const sitemapXml = buffer.toString();

  console.log("🗺️", "Generating sitemap.xml ... Done!");

  return sitemapXml;
};

export default defineEventHandler(async (event) => {
  setHeader(event, "content-type", "application/xml");
  const routes = await fetchPrerenderRoutes();
  return await generateSitemap(routes);
});
