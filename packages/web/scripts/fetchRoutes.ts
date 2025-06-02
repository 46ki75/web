export const fetchPrerenderRoutes = async (
  endpoint: string
): Promise<string[]> => {
  console.info("Execute fetchPrerenderRoutes()...");

  const articleRoutes = await fetchArticleRoutes(endpoint);

  const staticRoutes = [
    "/",
    "/about",
    "/image-converter",
    "/blog",
    "/blog/article",
    "/blog/search",
  ]
    .map((route) => [route, `/ja${route}`])
    .flat();

  const routes = [...staticRoutes, ...articleRoutes];

  console.info("Routes:");
  routes.forEach((route) => console.log(`🔗 ${route}`));

  return routes;
};

const fetchArticleRoutes = async (endpoint: string) => {
  console.info("Execute fetchArticleRoutes()...");

  const englishResponse = await fetch(`${endpoint}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query Routes {
          blogList(language: EN) {
            id
          }
        }
      `,
    }),
  });

  const englishJson: { data: { blogList: Array<{ id: string }> } } =
    await englishResponse.json();

  const englishRoutes = englishJson.data.blogList.map(
    (blog) => `/blog/article/${blog.id}`
  );

  const japaneseResponse = await fetch(`${endpoint}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query Routes {
          blogList(language: JA) {
            id
          }
        }
      `,
    }),
  });

  const japaneseJson: { data: { blogList: Array<{ id: string }> } } =
    await japaneseResponse.json();

  const japaneseRoutes = japaneseJson.data.blogList.map(
    (blog) => `/ja/blog/article/${blog.id}`
  );

  return englishRoutes.concat(japaneseRoutes);
};
