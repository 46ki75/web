<template>
  <div>
    <div :key="`/blog/article/${blog.id}`" v-if="blog != null">
      <BlogMeta
        :key="`/blog/article/${blog.id}`"
        :title="blog.title"
        :created-at="blog.createdAt"
        :updated-at="blog.updatedAt"
        :links="[
          { text: 'Home', href: '/' },
          { text: 'Blog', href: '/blog' },
          { text: 'Article', href: `/blog/article/${blog.id}` },
        ]"
        :image="`${config.public.ENDPOINT}/api/blog/image/ogp/${blog.id}`"
        :tags="
          blog.tags.map((tag) => ({
            id: tag.id,
            label: tag.name,
            color: tag.color,
          }))
        "
      />

      <article :key="`/blog/article/${blog.id}`">
        <ElmJsonRenderer :json="data?.blockList ?? []" />
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElmJsonRenderer, type ElmJsonRendererProps } from "@elmethis/core";

const blogStore = useBlogStore();

const route = useRoute();
const config = useRuntimeConfig();

const blog = computed(() => {
  if (blogStore.blogs) {
    const [result] = blogStore.blogs.filter(
      (blog) => blog.id === route.params.id
    );

    return result;
  }
});

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
      data: { blog: { blockList: ElmJsonRendererProps["json"] } };
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

useSeoMeta({
  title: blog.value?.title,
  ogTitle: blog.value?.title,
  description: blog.value?.description,
  ogDescription: blog.value?.description,
  ogImage: `${config.public.ENDPOINT}/api/blog/image/ogp/${blog.value?.id}`,
  twitterCard: "summary_large_image",
});
</script>
