import type { Component } from "jarkup-ts";
import { ENDPOINT } from "./fetchConfig";

export interface PrerenderBlog {
  id: string;
  ogpImageS3Url: string;
  blockList: Component[];
  updatedAt: string;
}

export const fetchBlogList = async (): Promise<PrerenderBlog[]> => {
  const englishResponse = await fetch(`${ENDPOINT}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query ListBlog {
          blogList(language: EN) {
            id
            ogpImageS3Url
            blockList
            updatedAt
          }
        }
      `,
    }),
  });

  const englishBlog: {
    data: {
      blogList: PrerenderBlog[];
    };
  } = await englishResponse.json();

  const japaneseResponse = await fetch(`${ENDPOINT}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query ListBlog {
          blogList(language: JA) {
            id
            ogpImageS3Url
            blockList
            updatedAt
          }
        }
      `,
    }),
  });

  const japaneseBlog: {
    data: {
      blogList: PrerenderBlog[];
    };
  } = await japaneseResponse.json();

  return japaneseBlog.data.blogList.concat(englishBlog.data.blogList);
};
