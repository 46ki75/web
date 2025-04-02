import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import { ENDPOINT } from "./fetchConfig";
import type { PrerenderBlog } from "./fetchBlogList";

export const generateSitemap = async (blogs: PrerenderBlog[]) => {
  console.log("🗺️", "Generating sitemap.xml ...");

  const sitemap = new SitemapStream({ hostname: ENDPOINT });
  const writeStream = createWriteStream("./public/sitemap.xml");

  sitemap.pipe(writeStream);

  sitemap.write({ url: "/", changefreq: "weekly", priority: 1.0 });
  sitemap.write({ url: "/about", changefreq: "weekly", priority: 1.0 });
  sitemap.write({ url: "/blog", changefreq: "weekly", priority: 0.3 });
  sitemap.write({ url: "/blog/search", changefreq: "weekly", priority: 0.1 });

  for (const blog of blogs) {
    sitemap.write({
      url: `/blog/article/${blog.id}`,
      changefreq: "weekly",
      priority: 0.5,
      lastmod: blog.updatedAt,
    });
  }

  sitemap.end();

  await streamToPromise(sitemap);

  console.log("🗺️", "Generating sitemap.xml ... Done!");
};
