<template>
  <article>
    <div v-if="blog != null">
      <BlogMeta
        :title="blog.title"
        :created-at="blog.createdAt"
        :updated-at="blog.updatedAt"
        :links="[
          { text: 'Home', href: locale === 'en' ? '/' : `/${locale}` },
          { text: 'Blog', href: locale === 'en' ? '/blog' : `/${locale}/blog` },
          {
            text: 'Article',
            href:
              locale === 'en'
                ? `/blog/article/${blog.id}`
                : `/${locale}/blog/article/${blog.id}`,
          },
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
        <ElmJsonComponentRenderer :json-components="data?.blockList ?? []" />
      </div>

      <BlogEditOnNotion :url="blog.url" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { ElmJsonComponentRenderer } from "@elmethis/core";
import type { Component } from "jarkup-ts";

const { locale, defaultLocale } = useI18n();

const router = useRouter();

const blogStore = useBlogStore();

const route = useRoute();
const appConfig = useAppConfig();

const blog = computed(() => {
  const blogs = blogStore[locale.value].blogs;

  if (blogs != null) {
    const [result] = blogs.filter((blog) => blog.id === route.params.id);

    return result;
  }
});

const convert = (
  blocks: Component[],
  results: Array<{ from: string; to: string }>,
  id: string
) => {
  for (const block of blocks) {
    if (block.type === "Image" && block.props?.src && block.id) {
      results.push({
        from: block.props.src,
        to: `/_notion/blog/image/${id}/${block.id}.webp`,
      });
    } else if (block.type === "Icon" && block.props?.src && block.id) {
      results.push({
        from: block.props.src,
        to: `/_notion/blog/image/${id}/${block.id}.webp`,
      });
    }

    if (block.slots && "default" in block.slots) {
      convert(block.slots.default, results, id);
    }
  }

  const serialized = JSON.stringify(blocks);
  const converted = results.reduce(
    (acc, { from, to }) => acc.split(from).join(to),
    serialized
  );
  const deserialized = JSON.parse(converted);

  return deserialized as Component[];
};

const { data } = await useAsyncData(
  `/blog/article/${route.params.id}`,
  async () => {
    const blog = await $fetch<{
      data: { blog: { id: string; blockList: Component[] } };
    }>(`${appConfig.ENDPOINT}/api/graphql`, {
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

const isExistBlog = () => {
  const id = route.params.id;
  const flag = blogStore[locale.value].blogs?.some((blog) => blog.id === id);
  return flag;
};

onMounted(() => {
  if (!isExistBlog())
    router.push(
      locale.value === defaultLocale ? "/blog" : `/${locale.value}/blog`
    );
});

if (blog.value) {
  useSeoMeta({
    ogType: "article",
    title: `${blog.value.title} | ${appConfig.SITE_NAME}`,
    ogTitle: blog.value.title,
    description: blog.value.description,
    ogDescription: blog.value.description,
    ogImage: `${appConfig.ENDPOINT}/_notion/blog/image/${blog.value.id}/ogp.webp`,
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
          image: `${appConfig.ENDPOINT}/_notion/blog/image/${blog.value.id}/ogp.webp`,
          url: `${appConfig.ENDPOINT}${route.fullPath}`,
          author: {
            "@type": "Person",
            givenName: "Ikuma",
            familyName: "Yamashita",
          },
          datePublished: blog.value.createdAt,
          dateModified: blog.value.updatedAt,
        }),
      },
    ],
  });
}
</script>
