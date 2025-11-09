import { client } from "../openapi/client";

export interface PrerenderBlog {
  created_at: string;
  description: string;
  featured: boolean;
  keywords: string[];
  notion_url: string;
  ogp_image_s3_signed_url?: string | null | undefined;
  page_id: string;
  slug: string;
  status: "Draft" | "Archived" | "Private" | "Published";
  tag_ids: string[];
  title: string;
  updated_at: string;
  language: "en" | "ja";
}

let BLOG_LIST_CACHE: PrerenderBlog[] | null = null;
let BLOG_LIST_CACHE_EN: PrerenderBlog[] | null = null;
let BLOG_LIST_CACHE_JA: PrerenderBlog[] | null = null;

export const fetchBlogListEn = async (): Promise<PrerenderBlog[]> => {
  if (BLOG_LIST_CACHE_EN != null) return BLOG_LIST_CACHE_EN;

  const { data } = await client.GET("/api/v2/blog", {
    params: { header: { "accept-language": "en" } },
  });

  if (data == null) {
    throw new Error("Failed to fetch blogs");
  }

  BLOG_LIST_CACHE_EN = data.map((d) => ({ ...d, language: "en" }));

  return BLOG_LIST_CACHE_EN;
};

export const fetchBlogListJa = async (): Promise<PrerenderBlog[]> => {
  if (BLOG_LIST_CACHE_JA != null) return BLOG_LIST_CACHE_JA;

  const { data } = await client.GET("/api/v2/blog", {
    params: { header: { "accept-language": "ja" } },
  });

  if (data == null) {
    throw new Error("Failed to fetch blogs");
  }

  BLOG_LIST_CACHE_JA = data.map((d) => ({ ...d, language: "ja" }));

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
