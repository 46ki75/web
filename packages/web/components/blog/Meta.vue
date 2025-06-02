<template>
  <div>
    <ElmBreadcrumb
      :links="
        links.map((link) => ({
          text: link.text,
          onClick: () => {
            $router.push(link.href);
          },
        }))
      "
    />

    <ElmHeading :level="1" :text="title" disable-fragment-identifier />

    <BlogDate :created-at="createdAt" :updated-at="updatedAt" />

    <div v-if="tags" class="tag">
      <NuxtLinkLocale
        v-for="tag in tags"
        :key="tag.id"
        :to="`/blog/search`"
        :style="{ all: 'unset' }"
        :prefetch="false"
      >
        <BlogTag :id="tag.id" :label="tag.label" :color="tag.color" />
      </NuxtLinkLocale>
    </div>

    <div class="image">
      <ElmImage
        v-if="image"
        :src="image"
        alt="ブログ記事のOGP画像"
        enable-modal
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElmBreadcrumb, ElmHeading, ElmImage } from "@elmethis/core";

interface BlogMetaProps {
  title: string;
  links: Array<{
    text: string;
    href: string;
  }>;
  createdAt: string;
  updatedAt: string;
  image?: string;
  tags?: Array<{
    id: string;
    label: string;
    color: string;
  }>;
}

defineProps<BlogMetaProps>();
</script>

<style lang="scss" scoped>
.tag {
  margin-block: 0.25rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.image {
  margin-block: 1rem;
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 0 0.125rem rgba(black, 0.3);
}
</style>
