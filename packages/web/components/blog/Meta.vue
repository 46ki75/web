<template>
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

  <ElmHeading1 :text="title" />

  <BlogDate :created-at="createdAt" :updated-at="updatedAt" />

  <div class="tag" v-if="tags">
    <BlogTag v-for="tag in tags" :label="tag.label" :color="tag.color" />
  </div>

  <div class="image">
    <ElmImage v-if="image" :src="image" />
  </div>
</template>

<script setup lang="ts">
import { ElmBreadcrumb, ElmHeading1, ElmImage, ElmTag } from "@elmethis/core";

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
