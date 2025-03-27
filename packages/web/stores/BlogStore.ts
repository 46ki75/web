import Fuse from "fuse.js";

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
  createdAt: string;
  updatedAt: string;
}

export const useBlogStore = defineStore("BlogSearchStore", {
  state: () => {
    const config = useRuntimeConfig();

    const { data: tags } = useAsyncData("SearchListTags", async () => {
      const response = await $fetch<{
        data: { tagList: Array<BlogTag> };
      }>(`${config.public.ENDPOINT}/api/graphql`, {
        method: "POST",
        body: {
          query: /* GraphQL */ `
            query ListTags {
              tagList {
                id
                name
                color
              }
            }
          `,
        },
      });

      return response.data.tagList;
    });

    const { data: blogs } = useAsyncData("SearchListBlogs", async () => {
      const response = await $fetch<{
        data: { blogList: Blog[] };
      }>(`${config.public.ENDPOINT}/api/graphql`, {
        method: "POST",
        body: {
          query: /* GraphQL */ `
            query ListBlogs {
              blogList {
                id
                title
                description
                status
                tags {
                  id
                  name
                  color
                }
                createdAt
                updatedAt
              }
            }
          `,
        },
      });

      return response.data.blogList;
    });

    return {
      tags,
      selectedTags: [] as BlogTag[],
      keyword: undefined as string | undefined,
      blogs,
      searchedBlogs: [] as Blog[],
      fuse: undefined as Fuse<Blog> | undefined,
    };
  },
  actions: {
    tagSelect(tagId: string) {
      if (this.tags == null) return;

      const tags = this.tags.filter((tag) => tag.id === tagId);
      if (
        tags.length === 1 &&
        !this.selectedTags.map((tag) => tag.id).includes(tags[0].id)
      ) {
        this.selectedTags.push(tags[0]);
        this.searchBlog();
      }
    },
    tagDeselect(tagId: string) {
      this.selectedTags = this.selectedTags.filter((tag) => tag.id !== tagId);
      this.searchBlog();
    },
    tagReset() {
      this.selectedTags = [];
      this.searchBlog();
    },
    searchBlog() {
      if (this.blogs == null) return;
      if (this.tags == null) return;

      // Tag only searching
      if (this.keyword == null || this.keyword.trim() === "") {
        this.searchedBlogs = this.blogs.filter((blog) => {
          const tagIds = blog.tags.map((tag) => tag.id);
          const selectedTagIds = this.selectedTags.map((tag) => tag.id);
          const flag = selectedTagIds.every((tagId) => tagIds.includes(tagId));
          return flag;
        });
      }
      // Tag and Keyword searching
      else {
        if (this.fuse == null) {
          this.fuse = new Fuse(this.blogs, {
            keys: ["title", "description"],
            threshold: 0.5,
          });
        }

        if (this.keyword && this.fuse) {
          const fuzzyResults = this.fuse
            .search(this.keyword)
            .map((r) => r.item);
          if (this.selectedTags.length > 0) {
            this.searchedBlogs = fuzzyResults.filter((blog) => {
              const tagIds = blog.tags.map((tag) => tag.id);
              const selectedTagIds = this.selectedTags.map((tag) => tag.id);
              const flag = selectedTagIds.every((tagId) =>
                tagIds.includes(tagId)
              );
              return flag;
            });
          } else {
            this.searchedBlogs = fuzzyResults;
          }
        }
      }
    },
  },
  getters: {
    getSideBlogs(): Blog[] {
      if (this.blogs == null) return [];

      const results = this.blogs
        .sort(
          (pre, next) =>
            new Date(next.createdAt).getTime() -
            new Date(pre.createdAt).getTime()
        )
        .slice(0, 10);

      return results;
    },
  },
});
