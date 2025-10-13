<template>
  <div :key="`/${locale}/blog/search`">
    <BlogMeta
      :title="t('blog.search.title')"
      created-at="2022-10-01"
      updated-at="2025-03-26"
      :links="[
        { text: 'Home', href: locale === 'en' ? '/' : `/${locale}` },
        { text: 'Blog', href: locale === 'en' ? '/blog' : `/${locale}/blog` },
        {
          text: 'Search',
          href: locale === 'en' ? '/blog/search' : `/${locale}/blog/search`,
        },
      ]"
      :language="locale"
    />
    <div>
      <ElmTextField
        v-model="debouncedKeyword"
        :label="t('blog.search.label')"
        icon="search"
      />

      <div class="tag-container">
        <ElmHeading
          :level="3"
          :text="t('blog.search.allTags')"
          disable-fragment-identifier
        />
        <div v-if="blogStore[locale].tags" class="tag-pool">
          <BlogTag
            v-for="tag in blogStore[locale].tags"
            :id="tag.id"
            :key="tag.id"
            :label="tag.name"
            :color="'red'"
            @click="blogStore.tagSelect(tag.id)"
          />
        </div>
      </div>

      <div class="tag-container">
        <ElmHeading
          :level="3"
          :text="t('blog.search.selectedTags')"
          disable-fragment-identifier
        />
        <TransitionGroup name="tag" class="tag-pool" tag="dev">
          <BlogTag
            v-for="tag in blogStore.getTags(
              blogStore[locale].searchSelectedTagIds
            )"
            :id="tag.id"
            :key="tag.id"
            :label="tag.name"
            :color="tag.color"
            @click="blogStore.tagDeselect(tag.id)"
          />
          <div
            v-if="blogStore[locale].searchSelectedTagIds.length === 0"
            class="empty-container"
            :style="{ position: 'absolute', top: '-2rem', left: 0 }"
          >
            <Icon icon="fa-solid:tags" color="#788191" height="0.85rem" />
            <span>{{ t("blog.search.noTagsSelected") }}</span>
          </div>
        </TransitionGroup>

        <ElmButton block @click="blogStore.tagReset">
          <Icon icon="fluent:tag-reset-20-filled" height="20px" />
          {{ t("blog.search.clearSelection") }}
        </ElmButton>
      </div>

      <ElmHeading
        :level="3"
        :text="t('blog.search.searchResults')"
        disable-fragment-identifier
      />

      <TransitionGroup name="search" class="search-results" tag="div">
        <div
          v-if="blogStore[locale].searchedBlogs.length === 0"
          class="empty-container"
          :style="{ '--height': '16rem' }"
        >
          <Icon
            icon="material-symbols:document-search"
            color="#788191"
            height="1rem"
          />
          <span>{{ t("blog.search.noResultsFound") }}</span>
        </div>
        <div
          v-for="blog in blogStore[locale].searchedBlogs"
          :key="blog.slug"
          class="search-results-item"
        >
          <BlogCard
            :id="blog.slug"
            :title="blog.title"
            :description="blog.description"
            :tags="blogStore.getTags(blog.tag_ids)"
            :created-at="blog.created_at"
            :updated-at="blog.updated_at"
            :featured="blog.featured"
            :locale="locale"
          />
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElmButton, ElmHeading, ElmTextField } from "@elmethis/core";
import { Icon } from "@iconify/vue";
import { watchDebounced } from "@vueuse/core";

const { locale, t } = useI18n();

const blogStore = useBlogStore();

const debouncedKeyword = shallowRef<string>("");

watchDebounced(
  debouncedKeyword,
  () => {
    blogStore[locale.value].searchKeyword = debouncedKeyword.value;
    blogStore.searchBlog();
  },
  { debounce: 300, maxWait: 3000 }
);

watch(
  [() => blogStore[locale.value].searchSelectedTagIds],
  async () => {
    await nextTick();
    blogStore.searchBlog();
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  blogStore.searchBlog();
});
</script>

<style lang="scss" scoped>
.tag-container {
  margin-block: 2rem;
}

.tag-pool {
  position: relative;
  height: 2rem;
  margin-block: 2rem;
  display: flex;
  flex-wrap: wrap;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-results-item {
  transition: flex 0.3s;
}

.empty-container {
  width: 100%;
  height: var(--height);
  box-sizing: border-box;
  padding: 1rem;
  margin-block: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  border: 1px dashed #788191;
  color: #788191;
  user-select: none;
}

// Transition
.search-enter-to,
.search-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.search-enter-active,
.search-leave-active {
  transition: opacity 300ms, transform 300ms;
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.tag-enter-to,
.tag-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.tag-enter-active,
.tag-leave-active {
  transition: opacity 100ms, transform 100ms;
}

.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
