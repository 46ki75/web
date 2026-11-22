import {
  Client,
  collectPaginatedAPI,
  isFullPage,
  isNotionClientError,
  type PageObjectResponse,
  type QueryDataSourceParameters,
  type RichTextItemResponse,
} from "@notionhq/client";
import {
  blogLocales,
  isArticleSlug,
  type BlogLocale,
  type BlogSnapshotEntry,
  type BlogTagSnapshot,
} from "@web/blog-snapshot";
import { N2A2UIClient } from "n2a2ui";

export class SnapshotError extends Error {}

const envNames = [
  "NOTION_TOKEN",
  "NOTION_ARTICLE_DATA_SOURCE_ID",
  "NOTION_TAG_DATA_SOURCE_ID",
] as const;

export function notionSettings(env: NodeJS.ProcessEnv) {
  const missing = envNames.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new SnapshotError(
      `Missing environment variables: ${missing.join(", ")}`,
    );
  }
  const [token, articles, tags] = envNames.map((name) => env[name]!.trim());
  if (!/^[\x21-\x7e]+$/.test(token)) {
    throw new SnapshotError("NOTION_TOKEN is not a valid HTTP header value");
  }
  return { token, articles, tags };
}

type Property = PageObjectResponse["properties"][string];
function property<T extends Property["type"]>(
  page: PageObjectResponse,
  name: string,
  type: T,
) {
  const value = page.properties[name];
  if (value?.type !== type) {
    throw new SnapshotError(
      `Notion page ${page.id} needs a ${type} property named ${name}`,
    );
  }
  return value as Extract<Property, { type: T }>;
}

const plain = (items: RichTextItemResponse[]) =>
  items.map((item) => item.plain_text).join("");

function date(page: PageObjectResponse, name: string) {
  const value = property(page, name, "date").date?.start;
  if (!value || !Number.isFinite(Date.parse(value))) {
    throw new SnapshotError(
      `Notion page ${page.id} needs a valid ${name} date`,
    );
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00Z`;
  // Keep Notion's offset as Rust did, but match its RFC 3339 rendering of fractions/UTC.
  return value
    .replace(/(\.\d*?[1-9])0+(?=Z|[+-])|\.0+(?=Z|[+-])/g, "$1")
    .replace(/\+00:00$/, "Z");
}

export interface NotionArticle {
  locale: BlogLocale;
  meta: BlogSnapshotEntry;
  contentPageId: string;
  cover: string;
}

export function notionSource(
  settings: ReturnType<typeof notionSettings>,
  client?: Client,
) {
  const notion =
    client ?? new Client({ auth: settings.token, logger: () => {} });
  // The publisher downloads each asset itself, with host/size limits and no URL logging.
  const converter = new N2A2UIClient({ notion });

  async function request<T>(operation: string, run: () => Promise<T>) {
    try {
      return await run();
    } catch (error) {
      // SDK responses and media errors can contain private workspaces or signed URLs.
      const suffix = isNotionClientError(error) ? ` (${error.code})` : "";
      throw new SnapshotError(`Notion ${operation} failed${suffix}`);
    }
  }

  async function query(params: QueryDataSourceParameters) {
    const results = await request("data source query", () =>
      collectPaginatedAPI(notion.dataSources.query, params),
    );
    return results.map((page) => {
      if (!isFullPage(page))
        throw new SnapshotError(
          "Notion data source returned a non-page or partial object",
        );
      return page;
    });
  }

  return {
    async articles() {
      const pages = await query({
        data_source_id: settings.articles,
        filter: { property: "status", status: { equals: "Published" } },
      });
      const slugs = new Set<string>();
      const articles: NotionArticle[] = [];
      for (const page of pages) {
        if (
          property(page, "status", "status").status?.name !== "Published" ||
          page.in_trash
        ) {
          throw new SnapshotError(
            `Notion returned a non-published article master: ${page.id}`,
          );
        }
        const slug = plain(property(page, "slug", "rich_text").rich_text);
        if (!isArticleSlug(slug) || slugs.has(slug)) {
          throw new SnapshotError(
            `Notion article master ${page.id} has an invalid or duplicate slug`,
          );
        }
        slugs.add(slug);
        const featured = property(page, "featured", "checkbox").checkbox;
        const tags = property(page, "tag_ids", "relation");
        if ("has_more" in tags && tags.has_more === true)
          throw new SnapshotError(
            `Notion article master ${page.id} exceeds the tag relation limit`,
          );
        for (const locale of blogLocales) {
          const related = property(
            page,
            `article_${locale}`,
            "relation",
          ).relation;
          if (related.length !== 1)
            throw new SnapshotError(
              `Notion article master ${page.id} needs one ${locale} article`,
            );
          const article = await request("article page retrieval", () =>
            notion.pages.retrieve({ page_id: related[0].id }),
          );
          if (!isFullPage(article) || article.in_trash)
            throw new SnapshotError(
              `Notion article page ${related[0].id} is partial or trashed`,
            );
          const cover =
            article.cover?.type === "file"
              ? article.cover.file.url
              : article.cover?.external.url;
          if (!cover)
            throw new SnapshotError(
              `Notion article page ${article.id} needs a cover image`,
            );
          articles.push({
            locale,
            contentPageId: article.id,
            cover,
            meta: {
              page_id: page.id,
              notion_url: page.url,
              slug,
              featured,
              tag_ids: tags.relation.map(({ id }) => id),
              status: "Published",
              title: plain(property(article, "title", "title").title),
              description: plain(
                property(article, "description", "rich_text").rich_text,
              ),
              keywords: plain(
                property(article, "keywords", "rich_text").rich_text,
              )
                .split(",")
                .map((word) => word.trim()),
              created_at: date(article, "created_at"),
              updated_at: date(article, "updated_at"),
            },
          });
        }
      }
      return articles;
    },
    async tags(): Promise<BlogTagSnapshot[]> {
      const tags = await query({ data_source_id: settings.tags });
      return tags.map((page) => {
        const { icon } = page;
        return {
          id: page.id,
          name_en: plain(property(page, "name_en", "rich_text").rich_text),
          name_ja: plain(property(page, "name_ja", "rich_text").rich_text),
          icon_url:
            icon?.type === "file"
              ? icon.file.url
              : icon?.type === "external"
                ? icon.external.url
                : icon?.type === "custom_emoji"
                  ? icon.custom_emoji.url
                  : null,
        };
      });
    },
    async surface(pageId: string) {
      return request("block conversion", () => converter.convertBlock(pageId));
    },
  };
}
