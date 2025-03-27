import { statSync, mkdirSync, rmSync } from "node:fs";

export const fetchArticleRoutes = async (endpoint: string) => {
  const stat = statSync("public/_notion");

  if (stat.isDirectory()) {
    rmSync("public/_notion", { recursive: true, force: true });
  }

  mkdirSync("public/_notion/blog/image/ogp", { recursive: true });
  mkdirSync("public/_notion/blog/image/block", { recursive: true });

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
