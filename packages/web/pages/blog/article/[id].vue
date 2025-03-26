<template>
  <div v-if="data != null">
    <BlogMeta
      :title="data.title"
      :created-at="data.createdAt"
      :updated-at="data.updatedAt"
      :links="[
        { text: 'Home', href: '/' },
        { text: 'Blog', href: '/blog' },
        { text: 'Article', href: `/blog/article/${data.id}` },
      ]"
      :image="`${config.public.ENDPOINT}/api/blog/image/ogp/${data.id}`"
      :tags="
        data.tags.map((tag) => ({
          id: tag.id,
          label: tag.name,
          color: tag.color,
        }))
      "
    />

    <div><ElmInlineText :text="`ID: ${$route.params.id}`" /></div>

    <article>
      <ElmJsonRenderer :json="data?.blockList ?? []" />
    </article>
  </div>
</template>

<script setup lang="ts">
import {
  ElmInlineText,
  ElmJsonRenderer,
  type ElmJsonRendererProps,
} from "@elmethis/core";

const route = useRoute();

const config = useRuntimeConfig();

const convert = (
  blocks: ElmJsonRendererProps["json"],
  results: Array<{ from: string; to: string }>
) => {
  for (const block of blocks) {
    if (block.type === "ElmImage" && block.props?.src && block.id) {
      results.push({
        from: block.props.src,
        to: `${config.public.ENDPOINT}/api/blog/image/block/${block.id}`,
      });
    }
    if (block.children && block.children.length > 0) {
      convert(block.children, results);
    }
  }

  const serialized = JSON.stringify(blocks);
  const converted = results.reduce(
    (acc, { from, to }) => acc.split(from).join(to),
    serialized
  );
  const deserialized = JSON.parse(converted);

  return deserialized as ElmJsonRendererProps["json"];
};

const { data } = await useAsyncData(
  `/blog/article/${route.params.id}`,
  async () => {
    const blog = await $fetch<{
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
          blockList: ElmJsonRendererProps["json"];
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

    const blockList = convert(blog.data.blog.blockList, []);
    blog.data.blog.blockList = blockList;

    return blog.data.blog;
  }
);
</script>
