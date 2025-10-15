import { fetchBlogListEn, fetchBlogListJa } from "./fetchBlogList";

export const fetchPrerenderRoutes = async (): Promise<string[]> => {
  console.info("Execute fetchPrerenderRoutes()...");

  const articleRoutes = await fetchArticleRoutes();

  const staticRoutes = [
    "/",
    "/about",
    "/privacy",
    "/image-converter",
    "/blog",
    "/blog/article",
    "/blog/search",
    "/redirect",
  ]
    .map((route) => [route, `/ja${route}`])
    .flat();

  const commonRoutes = ["/robots.txt", "/sitemap.xml"];

  const routes = [...staticRoutes, ...articleRoutes, ...commonRoutes];

  console.info("Routes:");
  routes.forEach((route) => console.log(`🔗 ${route}`));

  return routes;
};

const fetchArticleRoutes = async () => {
  console.info("Execute fetchArticleRoutes()...");

  const en = await fetchBlogListEn();
  const ja = await fetchBlogListJa();

  const englishRoutes = en.map((blog) => `/blog/article/${blog.slug}`);
  const japaneseRoutes = ja.map((blog) => `/ja/blog/article/${blog.slug}`);

  return englishRoutes.concat(japaneseRoutes);
};
