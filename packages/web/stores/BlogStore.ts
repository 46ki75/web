import { client } from "~/openapi/client";
import type { components } from "../openapi/schema";

interface Tag {
  id: string;
  name: string;
  icon_url?: string | null;
  // TODO: REMOVE THIS
  label: string;
  // TODO: REMOVE THIS
  color: string;
}

type BlogMeta = components["schemas"]["BlogResponse"];

export const useBlogStore = defineStore("BlogSearchStore", {
  state: () => {
    const { locale } = useI18n();

    const { data: tags } = useAsyncData("/blog/tags", async () => {
      const { data } = await client.GET("/api/v2/blog/tag");
      if (data == null) throw new Error("Failed to fetch blog tags.");

      const en = [];
      const ja = [];

      for (const tag of data) {
        en.push({
          id: tag.id,
          name: tag.name_en,
          icon_url: tag.icon_url,
        });
        ja.push({
          id: tag.id,
          name: tag.name_ja,
          icon_url: tag.icon_url,
        });
      }

      return { en, ja };
    });

    const { data: enBlogs } = useAsyncData("/blog/en", async () => {
      const { data } = await client.GET("/api/v2/blog", {
        params: { query: { language: "en" } },
      });
      if (data == null) throw new Error("Failed to fetch blogs.");
      return data;
    });

    const { data: jaBlogs } = useAsyncData("/blog/en", async () => {
      const { data } = await client.GET("/api/v2/blog", {
        params: { query: { language: "ja" } },
      });
      if (data == null) throw new Error("Failed to fetch blogs.");
      return data;
    });

    return {
      locale,

      en: {
        tags: tags.value?.en,
        blogs: enBlogs,

        searchKeyword: ref(""),
        searchSelectedTagIds: ref<string[]>([]),
        searchedBlogs: ref<BlogMeta[]>([]),
      },

      ja: {
        tags: tags.value?.ja,
        blogs: jaBlogs,

        searchKeyword: ref(""),
        searchSelectedTagIds: ref<string[]>([]),
        searchedBlogs: ref<BlogMeta[]>([]),
      },
    };
  },
  actions: {
    getTags(tagIds: string[]): Array<Tag> {
      const tags = this[this.locale].tags
        ?.filter((tag) => tagIds.some((id) => id === tag.id))
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          icon_url: tag.icon_url,
          label: tag.name,
          color: "red",
        }));
      return tags ?? [];
    },

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

    searchBlog() {},
  },
});
