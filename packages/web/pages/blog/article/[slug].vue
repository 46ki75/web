<template>
  <article>
    <div v-if="blogMeta != null">
      <BlogMeta
        :title="blogMeta.title"
        :created-at="blogMeta.created_at"
        :updated-at="blogMeta.updated_at"
        :links="[
          { text: 'Home', href: locale === 'en' ? '/' : `/${locale}` },
          { text: 'Blog', href: locale === 'en' ? '/blog' : `/${locale}/blog` },
          {
            text: 'Article',
            href:
              locale === 'en'
                ? `/blog/article/${blogMeta.slug}`
                : `/${locale}/blog/article/${blogMeta.slug}`,
          },
        ]"
        :image="`/_notion/blog/image/${blogMeta.slug}/${locale}/ogp.webp`"
        :tags="blogStore.tags(blogMeta.tag_ids)"
        @tag-click="handleTagClick"
      />

      <div>
        <ElmJsonComponentRenderer :json-components="jarkup ?? []" />
      </div>

      <BlogEditOnNotion :url="blogMeta.notion_url" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { ElmJsonComponentRenderer } from "@elmethis/core";
import type { Component } from "jarkup-ts";
import { client } from "~/openapi/client";

const { locale } = useI18n();

const router = useRouter();

const blogStore = useBlogStore();

const route = useRoute();
const appConfig = useAppConfig();

const handleTagClick = (tagId: string) => {
  blogStore.tagReset();
  blogStore.tagSelect(tagId);
  router.push(`${locale.value === "en" ? "" : locale.value}/blog/search`);
};

const convert = (
  blocks: Component[],
  results: Array<{ from: string; to: string }>,
  slug: string
) => {
  for (const block of blocks) {
    if (block.type === "Image" && block.props?.src && block.id) {
      results.push({
        from: block.props.src,
        to: `/_notion/blog/image/${slug}/${locale.value}/${block.id}.webp`,
      });
    } else if (block.type === "Icon" && block.props?.src && block.id) {
      results.push({
        from: block.props.src,
        to: `/_notion/blog/image/${slug}/${locale.value}/${block.id}.webp`,
      });
    }

    if (block.slots && "default" in block.slots) {
      convert(block.slots.default, results, slug);
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

const fetchBlog = async (locale: "en" | "ja") => {
  if (typeof route.params.slug !== "string") {
    throw new Error("Invalid path params");
  }

  const { data: enBlogContents } = await client.GET("/api/v2/blog/{slug}", {
    params: {
      path: { slug: route.params.slug as string },
      query: { language: locale },
    },
  });

  return convert(
    enBlogContents?.components as Component[],
    [],
    route.params.slug
  );
};

const { data: jarkup } = await useAsyncData(
  `/${locale.value}/blog/article/${route.params.slug}`,
  async () => fetchBlog(locale.value)
);

const blogMeta = computed(() => {
  const blogMeta = blogStore[locale.value].blogs?.find(
    (blog) => blog.slug === route.params.slug
  );
  return blogMeta;
});

if (blogMeta.value) {
  useSeoMeta({
    ogType: "article",
    title: `${blogMeta.value.title} | ${appConfig.SITE_NAME}`,
    ogTitle: blogMeta.value.title,
    description: blogMeta.value.description,
    ogDescription: blogMeta.value.description,
    ogImage: `${appConfig.ENDPOINT}/_notion/blog/image/${blogMeta.value.slug}/ogp.webp`,
    twitterCard: "summary_large_image",
    articlePublishedTime: blogMeta.value.created_at,
    articleModifiedTime: blogMeta.value.updated_at,
  });

  // @see https://json-ld.org/playground/
  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          name: blogMeta.value.title,
          headline: blogMeta.value.title,
          abstract: blogMeta.value.description,
          image: `${appConfig.ENDPOINT}/_notion/blog/image/${blogMeta.value.slug}/ogp.webp`,
          url: `${appConfig.ENDPOINT}${route.fullPath}`,
          author: {
            "@type": "Person",
            givenName: "Ikuma",
            familyName: "Yamashita",
          },
          datePublished: blogMeta.value.created_at,
          dateModified: blogMeta.value.updated_at,
        }),
      },
    ],
  });
}
</script>
