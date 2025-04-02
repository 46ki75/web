<template>
  <article>
    <div v-if="blog != null" :key="`/blog/article/${blog.id}`">
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
        :image="`/_notion/blog/image/${blog.id}/ogp.webp`"
        :tags="
          blog.tags.map((tag) => ({
            id: tag.id,
            label: tag.name,
            color: tag.color,
          }))
        "
      />

      <div :key="`/blog/article/${blog.id}`">
        <ElmJsonRenderer :json="data?.blockList ?? []" />
      </div>
    </div>
  </article>
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
  results: Array<{ from: string; to: string }>,
  id: string
) => {
  for (const block of blocks) {
    if (block.type === "ElmImage" && block.props?.src && block.id) {
      results.push({
        from: block.props.src,
        to: `/_notion/blog/image/${id}/${block.id}.webp`,
      });
    } else if (block.type === "ElmInlineIcon" && block.props?.src && block.id) {
      results.push({
        from: block.props.src,
        to: `/_notion/blog/image/${id}/${block.id}.webp`,
      });
    }

    if (block.children && block.children.length > 0) {
      convert(block.children, results, id);
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
      data: { blog: { id: string; blockList: ElmJsonRendererProps["json"] } };
    }>(`${config.public.ENDPOINT}/api/graphql`, {
      method: "POST",
      body: {
        query: /* GraphQL */ `
          query GetBlog($pageId: String!) {
            blog(pageId: $pageId) {
              id
              blockList
            }
          }
        `,
        variables: { pageId: route.params.id },
      },
    });

    const blockList = convert(blog.data.blog.blockList, [], blog.data.blog.id);
    blog.data.blog.blockList = blockList;

    return blog.data.blog;
  }
);

if (blog.value) {
  useSeoMeta({
    ogType: "article",
    ogUrl: `${config.public.ENDPOINT}/blog/article/${blog.value.id}`,
    title: blog.value.title,
    ogTitle: blog.value.title,
    description: blog.value.description,
    ogDescription: blog.value.description,
    ogImage: `${config.public.ENDPOINT}/_notion/blog/image/${blog.value.id}/ogp.webp`,
    twitterCard: "summary_large_image",
    articlePublishedTime: blog.value.createdAt,
    articleModifiedTime: blog.value.updatedAt,
    articleTag: blog.value.tags.map((tag) => tag.name),
  });

  // @see https://json-ld.org/playground/
  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          name: blog.value.title,
          headline: blog.value.title,
          abstract: blog.value.description,
          image: `${config.public.ENDPOINT}/_notion/blog/image/${blog.value.id}/ogp.webp`,
          url: `${config.public.ENDPOINT}/blog/article/${blog.value.id}`,
          author: {
            "@type": "Person",
            givenName: "Shirayuki",
            familyName: "Chomolungma",
          },
          datePublished: blog.value.createdAt,
          dateModified: blog.value.updatedAt,
        }),
      },
    ],
  });
}
</script>
