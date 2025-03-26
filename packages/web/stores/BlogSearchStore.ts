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

export const useBlogSearchStore = defineStore("BlogSearchStore", {
  state: () => {
    const config = useRuntimeConfig();
    const tagsResponse = useFetch<{
      data: { tagList: Array<BlogTag> };
    }>(`${config.public.ENDPOINT}/api/graphql`, {
      method: "POST",
      body: {
        query: /* GraphQL */ `
          {
            tagList {
              id
              name
              color
            }
          }
        `,
      },
    });

    const blogsResponse = useFetch<{
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

    return {
      tags: computed(() => tagsResponse.data.value?.data.tagList ?? []),
      selectedTags: [] as BlogTag[],
      keyword: undefined as string | undefined,
      blogs: computed(() => blogsResponse.data.value?.data.blogList ?? []),
      searchedBlogs: [] as Blog[],
    };
  },
  actions: {
    tagSelect(tagId: string) {
      const tags = this.tags.filter((tag) => tag.id === tagId);
      if (tags.length === 1) {
        this.selectedTags.push(tags[0]);
      }
    },
    tagDeselect(tagId: string) {
      this.selectedTags = this.selectedTags.filter((tag) => tag.id !== tagId);
    },
    tagReset() {
      this.selectedTags = [];
    },
    searchBlog() {
      const fuse = new Fuse(this.blogs, {
        keys: ["title", "description"],
        threshold: 0.5,
      });

      if (this.keyword) {
        const fuzzyResults = fuse.search(this.keyword).map((r) => r.item);
        this.searchedBlogs = fuzzyResults;
      } else {
        return [];
      }
    },
  },
});
