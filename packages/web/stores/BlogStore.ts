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

    const appConfig = useAppConfig();

    const { data: blogs } = useAsyncData(
      computed(() => `/${locale.value}/api/v2/blog`),
      async () => {
        const { data: blogs } = await client.GET("/api/v2/blog", {
          baseUrl: appConfig.ENDPOINT,
          params: { header: { "accept-language": locale.value } },
        });
        if (blogs == null) throw new Error("Failed to fetch blogs.");
        return blogs;
      },
      { watch: [locale] },
    );

    const { data: tags } = useAsyncData("/api/v2/blog/tag", async () => {
      const { data } = await client.GET("/api/v2/blog/tag", {
        baseUrl: appConfig.ENDPOINT,
      });
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

    const fuse = shallowRef<null | Fuse<BlogMeta>>(null);

    return {
      locale,

      // keep tags for both locales in state; getter will pick by locale
      tags: tags,
      blogs: blogs,
      fuse: fuse,

      searchKeyword: ref(""),
      searchSelectedTagIds: ref<string[]>([]),
      searchResults: ref<BlogMeta[]>([]),
    };
  },
  actions: {
    tagSelect({ tagId }: { tagId: string; locale: "en" | "ja" }) {
      this.searchSelectedTagIds.push(tagId);
    },

    tagDeselect({ tagId }: { tagId: string; locale: "en" | "ja" }) {
      this.searchSelectedTagIds = this.searchSelectedTagIds.filter(
        (deselectTagId) => deselectTagId !== tagId,
      );
    },

    tagReset({}: { locale: "en" | "ja" }) {
      this.searchSelectedTagIds = [];
    },

    searchBlog() {
      const blogs = this.blogs;
      if (
        blogs == null ||
        (this.searchKeyword == null && this.searchSelectedTagIds.length === 0)
      ) {
        return;
      }

      if (this.fuse === null) {
        this.fuse = new Fuse(this.blogs ?? [], {
          keys: [
            { name: "title", weight: 0.7 },
            { name: "description", weight: 0.3 },
            { name: "keywords", weight: 1 },
          ],
        });
      }

      if (this.searchKeyword.trim() !== "") {
        const searchResults = this.fuse?.search(this.searchKeyword) ?? [];
        this.searchResults = searchResults
          ?.map(({ item }) => item)
          .filter((blog) =>
            this.searchSelectedTagIds.every((tagId) =>
              blog.tag_ids.some((blogTagId) => blogTagId === tagId),
            ),
          );
      } else {
        this.searchResults = blogs.filter((blog) =>
          this.searchSelectedTagIds.every((tagId) =>
            blog.tag_ids.some((blogTagId) => blogTagId === tagId),
          ),
        );
      }
    },
  },
  getters: {
    getSideBlogs(state): BlogMeta[] | undefined {
      return state.blogs
        ?.sort(
          (pre, next) =>
            new Date(next.created_at).getTime() -
            new Date(pre.created_at).getTime(),
        )
        .slice(0, 10);
    },

    getTags(
      state,
    ): ({
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
        const tagsObject = ((state.tags as { value?: { en: Tag[]; ja: Tag[] } })
          ?.value ?? (state.tags as { en: Tag[]; ja: Tag[] })) as
          | { en: Tag[]; ja: Tag[] }
          | undefined;
        const allTags: Tag[] = tagsObject?.[locale] ?? [];
        const filtered = allTags
          .filter((tag: Tag) => tagIds.some((id) => id === tag.id))
          .map((tag: Tag) => ({
            id: tag.id,
            name: tag.name,
            iconUrl: tag.iconUrl,
          }));
        return filtered ?? [];
      };
    },

    // return all tags for a given locale
    allTags(state): (locale: "en" | "ja") => Tag[] {
      return (locale: "en" | "ja") => {
        const tagsObject = ((state.tags as { value?: { en: Tag[]; ja: Tag[] } })
          ?.value ?? (state.tags as { en: Tag[]; ja: Tag[] })) as
          | { en: Tag[]; ja: Tag[] }
          | undefined;
        return tagsObject?.[locale] ?? [];
      };
    },
  },
});
