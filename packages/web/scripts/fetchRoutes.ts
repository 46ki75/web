import { fetchBlogListEn, fetchBlogListJa } from "./fetchBlogList";

let cache: null | string[] = null;

const STATIC_ROUTES = [
  "/",
  "/about",
  "/privacy",
  "/image-converter",
  "/blog",
  "/blog/article",
  "/blog/search",
  "/redirect",
  "/talks",
]
  .map((route) => [route, `/ja${route}`])
  .flat();

const STATIC_COMMON_ROUTES = ["/robots.txt", "/sitemap.xml"];

export const fetchPrerenderRoutes = async (): Promise<string[]> => {
  console.info("Execute fetchPrerenderRoutes()...");

  if (cache != null) {
    console.info("cache hit!");
    return cache;
  }

  const articleRoutes = await fetchArticleRoutes();

  const routes = [...articleRoutes, ...STATIC_ROUTES, ...STATIC_COMMON_ROUTES];

  console.info("Routes:");
  routes.forEach((route) => console.log(`🔗 ${route}`));

  cache = routes;

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
