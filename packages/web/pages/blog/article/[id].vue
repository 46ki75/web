<template>
  <div><ElmInlineText :text="`ID: ${$route.params.id}`" /></div>

  <article>
    <ElmJsonRenderer :json="blog.data.value?.data.blog.blockList" />
  </article>
</template>

<script setup lang="ts">
import { ElmInlineText, ElmJsonRenderer } from "@elmethis/core";

const route = useRoute();

const config = useRuntimeConfig();

const blog = useFetch<{
  data: {
    blog: {
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
      blockList: any;
    };
  };
}>(`${config.public.ENDPOINT}/api/graphql`, {
  method: "POST",
  body: {
    query: /* GraphQL */ `
      query GetBlog($pageId: String!) {
        blog(pageId: $pageId) {
          id
          slug
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
          blockList
        }
      }
    `,
    variables: { pageId: route.params.id },
  },
});
</script>
