import type { components } from "./schema";

/**
 * Blog read client.
 *
 * The blog is published as static JSON to an S3-backed CDN path, so these reads
 * are plain `fetch`es of pre-rendered objects (no Lambda API call). The object
 * keys mirror the public URL paths, with the language baked into the path
 * instead of an `Accept-Language` header or `lang` query.
 */

export type BlogResponse = components["schemas"]["BlogResponse"];
export type BlogContentsResponse = components["schemas"]["BlogContentsResponse"];
export type BlogTagResponse = components["schemas"]["BlogTagResponse"];

export type BlogLanguage = "en" | "ja";

const apiBase = `https://${import.meta.env.VITE_API_DOMAIN}`;

const getJson = async <T>(
  path: string,
  signal?: AbortSignal,
): Promise<T | undefined> => {
  const response = await fetch(`${apiBase}${path}`, { signal });
  if (!response.ok) return undefined;
  return (await response.json()) as T;
};

/** Published blog index for a language (caller sorts as needed). */
export const getBlogList = (language: BlogLanguage, signal?: AbortSignal) =>
  getJson<BlogResponse[]>(`/cache/v2/blog/list/${language}.json`, signal);

/** Full rendered contents (meta + jarkup components) for a slug. */
export const getBlogContents = (
  slug: string,
  language: BlogLanguage,
  signal?: AbortSignal,
) =>
  getJson<BlogContentsResponse>(
    `/cache/v2/blog/article/${slug}/contents/${language}.json`,
    signal,
  );

/** Language-agnostic tag list. */
export const getBlogTags = (signal?: AbortSignal) =>
  getJson<BlogTagResponse[]>(`/cache/v2/blog/tags.json`, signal);

/** Path to a blog's materialized OGP cover image. */
export const ogImageUrl = (slug: string, language: BlogLanguage) =>
  `/cache/v2/blog/article/${slug}/og-image/${language}`;
