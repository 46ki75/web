import { client } from "~/openapi/client";
import type { components } from "../openapi/schema";
import Fuse from "fuse.js";

interface Tag {
  id: string;
  name: string;
  iconUrl?: string | null;
}

type BlogMeta = components["schemas"]["BlogResponse"];

export const useBlogStore = defineStore("BlogSearchStore", {
  state: () => {
    const { locale } = useI18n();

    const { data: enBlogs } = useAsyncData("/en/api/v2/blog", async () => {
      const { data: enBlogs } = await client.GET("/api/v2/blog", {
        params: { query: { language: "en" } },
      });
      if (enBlogs == null) throw new Error("Failed to fetch blogs.");
      return enBlogs;
    });

    const { data: jaBlogs } = useAsyncData("/ja/api/v2/blog", async () => {
      const { data: jaBlogs } = await client.GET("/api/v2/blog", {
        params: { query: { language: "ja" } },
      });
      if (jaBlogs == null) throw new Error("Failed to fetch blogs.");
      return jaBlogs;
    });

    const { data: tags } = useAsyncData("/api/v2/blog/tag", async () => {
      const { data } = await client.GET("/api/v2/blog/tag");
      if (data == null) throw new Error("Failed to fetch blog tags.");
      return {
        en: data.map((tag) => ({
          id: tag.id,
          name: tag.name_en,
          iconUrl: tag.icon_url,
        })),
        ja: data.map((tag) => ({
          id: tag.id,
          name: tag.name_ja,
          iconUrl: tag.icon_url,
        })),
      };
    });

    const enFuse = shallowRef<null | Fuse<BlogMeta>>(null);
    const jaFuse = shallowRef<null | Fuse<BlogMeta>>(null);

    return {
      locale,

      en: {
        tags: computed(() => tags.value?.en),
        blogs: enBlogs,
        fuse: enFuse,

        searchKeyword: "",
        searchSelectedTagIds: ref<string[]>([]),
        searchResults: ref<BlogMeta[]>([]),
      },

      ja: {
        tags: computed(() => tags.value?.ja),
        blogs: jaBlogs,
        fuse: jaFuse,

        searchKeyword: ref(""),
        searchSelectedTagIds: ref<string[]>([]),
        searchResults: ref<BlogMeta[]>([]),
      },
    };
  },
  actions: {
    tagSelect(tagId: string) {
      this[this.locale].searchSelectedTagIds.push(tagId);
    },

    tagDeselect(tagId: string) {
      this[this.locale].searchSelectedTagIds = this[
        this.locale
      ].searchSelectedTagIds.filter((deselectTagId) => deselectTagId !== tagId);
    },

    tagReset() {
      this[this.locale].searchSelectedTagIds = [];
    },

    searchBlog() {
      const blogs = this[this.locale].blogs;
      if (
        blogs == null ||
        (this[this.locale].searchKeyword == null &&
          this[this.locale].searchSelectedTagIds.length === 0)
      ) {
        return;
      }

      if (this[this.locale].fuse === null) {
        this[this.locale].fuse = new Fuse(this[this.locale].blogs ?? [], {
          keys: [
            { name: "title", weight: 0.7 },
            { name: "description", weight: 0.3 },
            { name: "keywords", weight: 1 },
          ],
        });
      }

      if (this[this.locale].searchKeyword.trim() !== "") {
        const searchResults =
          this[this.locale].fuse?.search(this[this.locale].searchKeyword) ?? [];
        this[this.locale].searchResults = searchResults
          ?.map(({ item }) => item)
          .filter((blog) =>
            this[this.locale].searchSelectedTagIds.every((tagId) =>
              blog.tag_ids.some((blogTagId) => blogTagId === tagId)
            )
          );
      } else {
        this[this.locale].searchResults = blogs.filter((blog) =>
          this[this.locale].searchSelectedTagIds.every((tagId) =>
            blog.tag_ids.some((blogTagId) => blogTagId === tagId)
          )
        );
      }
    },
  },
  getters: {
    sideBlogs(): (locale: "en" | "ja") => BlogMeta[] | undefined {
      return (locale: "en" | "ja") =>
        this[locale].blogs
          ?.sort(
            (pre, next) =>
              new Date(next.created_at).getTime() -
              new Date(pre.created_at).getTime()
          )
          .slice(0, 10);
    },

    tags(): ({
      tagIds,
      locale,
    }: {
      tagIds: string[];
      locale: "en" | "ja";
    }) => Tag[] {
      return ({
        tagIds,
        locale,
      }: {
        tagIds: string[];
        locale: "en" | "ja";
      }) => {
        const tags = this[locale].tags
          ?.filter((tag) => tagIds.some((id) => id === tag.id))
          .map((tag) => ({
            id: tag.id,
            name: tag.name,
            iconUrl: tag.iconUrl,
          }));
        return tags ?? [];
      };
    },
  },
});
