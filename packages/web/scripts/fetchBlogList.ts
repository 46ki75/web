import type { Component } from "jarkup-ts";
import { ENDPOINT } from "./fetchConfig";

export interface PrerenderBlog {
  id: string;
  title: string;
  description: string;
  ogpImageS3Url: string;
  blockList: Component[];
  updatedAt: string;
}

let BLOG_LIST_CACHE: PrerenderBlog[] | null = null;
let BLOG_LIST_CACHE_EN: PrerenderBlog[] | null = null;
let BLOG_LIST_CACHE_JA: PrerenderBlog[] | null = null;

export const fetchBlogListEn = async (): Promise<PrerenderBlog[]> => {
  if (BLOG_LIST_CACHE_EN != null) return BLOG_LIST_CACHE_EN;

  const englishResponse = await fetch(`${ENDPOINT}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query ListBlog {
          blogList(language: EN) {
            id
            title
            description
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

  BLOG_LIST_CACHE_EN = englishBlog.data.blogList;

  return BLOG_LIST_CACHE_EN;
};

export const fetchBlogListJa = async (): Promise<PrerenderBlog[]> => {
  if (BLOG_LIST_CACHE_JA != null) return BLOG_LIST_CACHE_JA;

  const japaneseResponse = await fetch(`${ENDPOINT}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query ListBlog {
          blogList(language: JA) {
            id
            title
            description
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

  BLOG_LIST_CACHE_JA = japaneseBlog.data.blogList;

  return BLOG_LIST_CACHE_JA;
};

export const fetchBlogList = async (): Promise<PrerenderBlog[]> => {
  if (BLOG_LIST_CACHE != null) return BLOG_LIST_CACHE;

  const en = await fetchBlogListEn();
  const ja = await fetchBlogListJa();

  const results = en.concat(ja);

  BLOG_LIST_CACHE = results;

  return results;
};
