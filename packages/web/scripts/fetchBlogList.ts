import type { ElmJsonRendererProps } from "@elmethis/core";
import { ENDPOINT } from "./fetchConfig";

export interface PrerenderBlog {
  id: string;
  ogpImageS3Url: string;
  blockList: ElmJsonRendererProps["json"];
  updatedAt: string;
}

export const fetchBlogList = async (): Promise<PrerenderBlog[]> => {
  const response = await fetch(`${ENDPOINT}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query ListBlog {
          blogList {
            id
            ogpImageS3Url
            blockList
            updatedAt
          }
        }
      `,
    }),
  });

  const blog: {
    data: {
      blogList: PrerenderBlog[];
    };
  } = await response.json();

  return blog.data.blogList;
};
