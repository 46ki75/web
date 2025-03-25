import { defineStore } from "pinia";

export const useBlogSideStore = defineStore("BlogSide", {
  state: () => {
    const config = useRuntimeConfig();
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

    const blogs = computed(() => response.data.value?.data.blogList);

    return {
      blogs,
    };
  },
});
