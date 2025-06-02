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
    const { locale } = useI18n();

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
      locale,

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
      if (this[this.locale].tags == null) return;

      const tags = this[this.locale].tags?.filter((tag) => tag.id === tagId);

      if (
        tags != null &&
        tags.length === 1 &&
        !this[this.locale].selectedTags
          .map((tag) => tag.id)
          .includes(tags[0].id)
      ) {
        this[this.locale].selectedTags.push(tags[0]);
        this.searchBlog();
      }
    },
    tagDeselect(tagId: string) {
      this[this.locale].selectedTags = this[this.locale].selectedTags.filter(
        (tag) => tag.id !== tagId
      );
      this.searchBlog();
    },
    tagReset() {
      this[this.locale].selectedTags = [];
      this.searchBlog();
    },
    searchBlog() {
      if (this[this.locale].blogs == null) return;
      if (this[this.locale].tags == null) return;

      // Tag only searching
      if (
        this[this.locale].keyword == null ||
        this[this.locale].keyword?.trim() === ""
      ) {
        this[this.locale].searchedBlogs =
          this[this.locale].blogs?.filter((blog) => {
            const tagIds = blog.tags.map((tag) => tag.id);
            const selectedTagIds = this[this.locale].selectedTags.map(
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
        if (this[this.locale].fuse == null) {
          this[this.locale].fuse = new Fuse(this[this.locale].blogs ?? [], {
            keys: ["title", "description", "keywords"],
            threshold: 0.5,
          });
        }

        if (this[this.locale].keyword && this[this.locale].fuse) {
          const fuzzyResults = this[this.locale].fuse
            .search(this[this.locale].keyword!)
            .map((r) => r.item);
          if (this[this.locale].selectedTags.length > 0) {
            this[this.locale].searchedBlogs = fuzzyResults.filter(
              (blog: Blog) => {
                const tagIds = blog.tags.map((tag: BlogTag) => tag.id);
                const selectedTagIds = this[this.locale].selectedTags.map(
                  (tag: BlogTag) => tag.id
                );
                const flag = selectedTagIds.every((tagId: string) =>
                  tagIds.includes(tagId)
                );
                return flag;
              }
            );
          } else {
            this[this.locale].searchedBlogs = fuzzyResults;
          }
        }
      }
    },
  },
});
