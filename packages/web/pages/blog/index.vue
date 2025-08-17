<template>
  <div key="/blog">
    <BlogMeta
      key="/blog"
      title="Blog Top"
      created-at="2022-10-01"
      updated-at="2025-03-26"
      :links="[
        { text: 'Home', href: locale === 'en' ? '/' : `/${locale}` },
        {
          text: 'Blog',
          href: `${locale === 'en' ? '/blog' : `/${locale}`}/blog`,
        },
      ]"
      :language="locale"
    />

    <div>
      <ElmHeading :level="2" :text="t('blog.index.featured-posts')" />

      <div class="blog-container">
        <BlogCard
          v-for="(blog, index) in blogStore[locale].blogs?.filter(
            (blog) => blog.featured
          )"
          :id="blog.id"
          :key="blog.id"
          :title="blog.title"
          :description="blog.description"
          :tags="blog.tags"
          :created-at="blog.createdAt"
          :updated-at="blog.updatedAt"
          :featured="blog.featured"
          :locale="locale"
          class="card"
          :style="{ '--delay': `${100 * index}ms` }"
        />
      </div>

      <ElmHeading :level="2" :text="t('blog.index.newest-posts')" />

      <div class="blog-container">
        <BlogCard
          v-for="(blog, index) in blogStore[locale].blogs?.slice(0, 4)"
          :id="blog.id"
          :key="blog.id"
          :title="blog.title"
          :description="blog.description"
          :tags="blog.tags"
          :created-at="blog.createdAt"
          :updated-at="blog.updatedAt"
          :featured="blog.featured"
          :locale="locale"
          class="card"
          :style="{ '--delay': `${100 * index}ms` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElmHeading } from "@elmethis/core";

const { locale, t } = useI18n();
const blogStore = useBlogStore();
</script>

<style lang="scss" scoped>
.blog-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.card {
  animation-name: fade-in;
  animation-delay: var(--delay);
  animation-duration: 400ms;
  animation-fill-mode: both;
}
</style>
