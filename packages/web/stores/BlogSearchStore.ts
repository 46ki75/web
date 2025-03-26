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
    return {
      tags: [] as BlogTag[],
      selectedTags: [] as BlogTag[],
      keyword: undefined as string | undefined,
      blogs: [] as Blog[],
      searchedBlogs: [] as Blog[],
      fuse: undefined as Fuse<Blog> | undefined,
    };
  },
  actions: {
    tagSelect(tagId: string) {
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
});
