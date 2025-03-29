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

    <ElmHeading1 :text="title" disable-fragment-identifier />

    <BlogDate :created-at="createdAt" :updated-at="updatedAt" />

    <div class="tag" v-if="tags">
      <NuxtLink
        v-for="tag in tags"
        :to="`/blog/search?tags=${tag.id}`"
        :style="{ all: 'unset' }"
        :prefetch="false"
      >
        <BlogTag :label="tag.label" :color="tag.color" />
      </NuxtLink>
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
import { ElmBreadcrumb, ElmHeading1, ElmImage } from "@elmethis/core";

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

const props = defineProps<BlogMetaProps>();
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
}
</style>
