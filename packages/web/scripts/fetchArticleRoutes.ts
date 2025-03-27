export const fetchArticleRoutes = async (endpoint: string) => {
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
