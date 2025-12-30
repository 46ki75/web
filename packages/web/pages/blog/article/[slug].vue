<template>
  <article>
    <div v-if="blog?.meta != null">
      <BlogMeta
        :title="blog.meta.title"
        :created-at="blog.meta.created_at"
        :updated-at="blog.meta.updated_at"
        :links="[
          { text: 'Home', href: locale === 'en' ? '/' : `/${locale}` },
          { text: 'Blog', href: locale === 'en' ? '/blog' : `/${locale}/blog` },
          {
            text: 'Article',
            href:
              locale === 'en'
                ? `/blog/article/${blog.meta.slug}`
                : `/${locale}/blog/article/${blog.meta.slug}`,
          },
        ]"
        :image="`/api/v2/blog/${blog.meta.slug}/og-image?lang=${locale}`"
        :tags="blogStore.getTags({ tagIds: blog.meta.tag_ids, locale })"
        @tag-click="handleTagClick"
      />

      <div>
        <ElmJsonComponentRenderer :json-components="blog?.components ?? []" />
      </div>

      <BlogEditOnNotion :url="blog.meta.notion_url" />
    </div>

    <div v-else>LOADING</div>
  </article>
</template>

<script setup lang="ts">
import { ElmJsonComponentRenderer } from "@elmethis/vue";
import type { Component } from "jarkup-ts";

import { client } from "~/openapi/client";
import type { paths } from "~/openapi/schema";

const { locale } = useI18n();

const blogStore = useBlogStore();

const route = useRoute();
const appConfig = useAppConfig();

const handleTagClick = (tagId: string) => {
  blogStore.tagReset({ locale: locale.value });
  blogStore.tagSelect({ tagId, locale: locale.value });
};

const { data: blog } = await useAsyncData(
  computed(() => `/${locale.value}/blog/article/${route.params.slug}`),
  async () => {
    if (typeof route.params.slug !== "string") {
      throw new Error("Invalid path params");
    }

    const { data: blogContents } = await client.GET("/api/v2/blog/{slug}", {
      params: {
        path: { slug: route.params.slug },
        header: { "accept-language": locale.value },
      },
    });

    return blogContents as {
      meta: paths["/api/v2/blog/{slug}"]["get"]["responses"]["200"]["content"]["application/json"]["meta"];
      components: Component[];
    };
  },
  {
    watch: [() => route.params.slug, locale],
  }
);

useSeoMeta({
  ogType: "article",
  title: () => `${blog.value?.meta?.title} | ${appConfig.SITE_NAME}`,
  ogTitle: () => blog.value?.meta?.title,
  description: () => blog.value?.meta?.description,
  ogDescription: () => blog.value?.meta?.description,
  ogImage: () =>
    `${appConfig.ENDPOINT}/api/v2/blog/${blog.value?.meta.slug}/og-image`,
  twitterCard: "summary_large_image",
  articlePublishedTime: () => blog.value?.meta?.created_at,
  articleModifiedTime: () => blog.value?.meta?.updated_at,
});

// @see https://json-ld.org/playground/
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        name: blog.value?.meta?.title,
        headline: blog.value?.meta?.title,
        abstract: blog.value?.meta?.description,
        image: `${appConfig.ENDPOINT}/api/v2/blog/${blog.value?.meta?.slug}/og-image`,
        url: `${appConfig.ENDPOINT}${route.fullPath}`,
        author: {
          "@type": "Person",
          givenName: "Ikuma",
          familyName: "Yamashita",
        },
        datePublished: blog.value?.meta?.created_at,
        dateModified: blog.value?.meta?.updated_at,
      }),
    },
  ],
});
</script>
