import Fuse from "fuse.js";
import type { ShallowRef } from "vue";

interface BlogTag {
  id: string;
  name: string;
  color: string;
}

interface Blog {
  id: string;
  title: string;
  description: string;
  tags: Array<BlogTag>;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export const useBlogStore = defineStore("BlogSearchStore", {
  state: () => {
    const config = useAppConfig();

    const { data: englishTags } = useAsyncData(
      "EnglishSearchListTags",
      async () => {
        const response = await $fetch<{
          data: { tagList: Array<BlogTag> };
        }>(`${config.ENDPOINT}/api/graphql`, {
          method: "POST",
          body: {
            query: /* GraphQL */ `
              query ListTags {
                tagList(language: EN) {
                  id
                  name
                  color
                }
              }
            `,
          },
        });

        return response.data.tagList;
      }
    );

    const { data: englishBlogs } = useAsyncData(
      "EnglishSearchListBlogs",
      async () => {
        const response = await $fetch<{
          data: { blogList: Blog[] };
        }>(`${config.ENDPOINT}/api/graphql`, {
          method: "POST",
          body: {
            query: /* GraphQL */ `
              query ListBlogs {
                blogList(language: EN) {
                  id
                  title
                  description
                  status
                  tags {
                    id
                    name
                    color
                  }
                  keywords
                  createdAt
                  updatedAt
                }
              }
            `,
          },
        });

        return response.data.blogList;
      }
    );

    const englishFuse = shallowRef<Fuse<Blog> | undefined>();

    const { data: japaneseTags } = useAsyncData(
      "JapaneseSearchListTags",
      async () => {
        const response = await $fetch<{
          data: { tagList: Array<BlogTag> };
        }>(`${config.ENDPOINT}/api/graphql`, {
          method: "POST",
          body: {
            query: /* GraphQL */ `
              query ListTags {
                tagList(language: JA) {
                  id
                  name
                  color
                }
              }
            `,
          },
        });

        return response.data.tagList;
      }
    );

    const { data: japaneseBlogs } = useAsyncData(
      "JapaneseSearchListBlogs",
      async () => {
        const response = await $fetch<{
          data: { blogList: Blog[] };
        }>(`${config.ENDPOINT}/api/graphql`, {
          method: "POST",
          body: {
            query: /* GraphQL */ `
              query ListBlogs {
                blogList(language: JA) {
                  id
                  title
                  description
                  status
                  tags {
                    id
                    name
                    color
                  }
                  keywords
                  createdAt
                  updatedAt
                }
              }
            `,
          },
        });

        return response.data.blogList;
      }
    );

    const japaneseFuse = shallowRef<Fuse<Blog> | undefined>();

    return {
      en: {
        tags: englishTags,
        selectedTags: [] as BlogTag[],
        keyword: undefined as string | undefined,
        blogs: englishBlogs ?? [],
        searchedBlogs: [] as Blog[],
        fuse: englishFuse as ShallowRef<Fuse<Blog>>,
      },

      ja: {
        tags: japaneseTags,
        selectedTags: [] as BlogTag[],
        keyword: undefined as string | undefined,
        blogs: japaneseBlogs ?? [],
        searchedBlogs: [] as Blog[],
        fuse: japaneseFuse as ShallowRef<Fuse<Blog>>,
      },
    };
  },
  actions: {
    tagSelect(tagId: string) {
      const { locale } = useI18n();

      if (this[locale.value].tags == null) return;

      const tags = this[locale.value].tags?.filter((tag) => tag.id === tagId);

      if (
        tags != null &&
        tags.length === 1 &&
        !this[locale.value].selectedTags
          .map((tag) => tag.id)
          .includes(tags[0].id)
      ) {
        this[locale.value].selectedTags.push(tags[0]);
        this.searchBlog();
      }
    },
    tagDeselect(tagId: string) {
      const { locale } = useI18n();

      this[locale.value].selectedTags = this[locale.value].selectedTags.filter(
        (tag) => tag.id !== tagId
      );
      this.searchBlog();
    },
    tagReset() {
      const { locale } = useI18n();

      this[locale.value].selectedTags = [];
      this.searchBlog();
    },
    searchBlog() {
      const { locale } = useI18n();

      if (this[locale.value].blogs == null) return;
      if (this[locale.value].tags == null) return;

      // Tag only searching
      if (
        this[locale.value].keyword == null ||
        this[locale.value].keyword?.trim() === ""
      ) {
        this[locale.value].searchedBlogs =
          this[locale.value].blogs?.filter((blog) => {
            const tagIds = blog.tags.map((tag) => tag.id);
            const selectedTagIds = this[locale.value].selectedTags.map(
              (tag) => tag.id
            );
            const flag = selectedTagIds.every((tagId) =>
              tagIds.includes(tagId)
            );
            return flag;
          }) ?? [];
      }
      // Tag and Keyword searching
      else {
        if (this[locale.value].fuse == null) {
          this[locale.value].fuse = new Fuse(this[locale.value].blogs ?? [], {
            keys: ["title", "description", "keywords"],
            threshold: 0.5,
          });
        }

        if (this[locale.value].keyword && this[locale.value].fuse) {
          const fuzzyResults = this[locale.value].fuse
            .search(this[locale.value].keyword!)
            .map((r) => r.item);
          if (this[locale.value].selectedTags.length > 0) {
            this[locale.value].searchedBlogs = fuzzyResults.filter(
              (blog: Blog) => {
                const tagIds = blog.tags.map((tag: BlogTag) => tag.id);
                const selectedTagIds = this[locale.value].selectedTags.map(
                  (tag: BlogTag) => tag.id
                );
                const flag = selectedTagIds.every((tagId: string) =>
                  tagIds.includes(tagId)
                );
                return flag;
              }
            );
          } else {
            this[locale.value].searchedBlogs = fuzzyResults;
          }
        }
      }
    },
  },
});
