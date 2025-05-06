export const fetchPrerenderRoutes = async (
  endpoint: string
): Promise<string[]> => {
  console.info("Execute fetchPrerenderRoutes()...");

  const articleRoutes = await fetchArticleRoutes(endpoint);

  const routes = [
    "/",
    "/about",
    "/image-converter",
    "/blog",
    "/blog/article",
    ...articleRoutes,
    "/blog/search",
  ];

  console.info("Routes:");
  routes.forEach((route) => console.log(`🔗 ${route}`));

  return routes;
};

const fetchArticleRoutes = async (endpoint: string) => {
  console.info("Execute fetchArticleRoutes()...");

  const res = await fetch(`${endpoint}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query Routes {
          blogList {
            id
          }
        }
      `,
    }),
  });

  const json: { data: { blogList: Array<{ id: string }> } } = await res.json();

  const routes = json.data.blogList.map((blog) => `/blog/article/${blog.id}`);

  return routes;
};
