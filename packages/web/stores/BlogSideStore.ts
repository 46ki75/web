import { defineStore } from "pinia";

export const useBlogSideStore = defineStore("BlogSide", {
  state: () => {
    const response = useFetch<{
      data: {
        blogList: Array<{
          id: string;
          title: string;
          description: string;
          tags: Array<{
            id: string;
            name: string;
            color: string;
          }>;
          createdAt: string;
          updatedAt: string;
        }>;
      };
    }>("https://dev-www.46ki75.com/api/graphql", {
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

    const blogs = computed(() => response.data.value?.data.blogList);

    return {
      blogs,
    };
  },
});
