import type { Locale } from "../i18n/locale";

export const contentRoot = "/content";
export const tagsPath = `${contentRoot}/blog/tags.json`;
export const badgesPath = `${contentRoot}/badges.json`;
export const listPath = (locale: Locale) =>
  `${contentRoot}/blog/list/${locale}.json`;

export function isArticleSlug(slug: string) {
  return (
    slug !== "" && slug !== "." && slug !== ".." && !/[\\/\p{Cc}]/u.test(slug)
  );
}

export const articlePath = (slug: string, locale: Locale) =>
  `${contentRoot}/blog/article/${encodeURIComponent(slug)}/${locale}.json`;

export const ogImageUrl = (slug: string, locale: Locale) =>
  `${contentRoot}/blog/article/${encodeURIComponent(slug)}/${locale}.webp`;

export const credlySource =
  "https://www.credly.com/users/ikuma-yamashita/badges.json";

export interface CredlyBadgeData {
  id: string;
  issued_at_date: string;
  expires_at_date?: string | null;
  badge_template: {
    name: string;
    description: string;
    image_url: string;
    url: string;
  };
}
