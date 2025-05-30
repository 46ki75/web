<template>
  <div key="/blog/search">
    <BlogMeta
      title="Search"
      created-at="2022-10-01"
      updated-at="2025-03-26"
      :links="[
        { text: 'Home', href: '/' },
        { text: 'Blog', href: '/blog' },
        { text: 'Search', href: '/blog/search' },
      ]"
    />

    <div key="/blog/search">
      <ElmTextField
        v-model="debouncedKeyword"
        label="検索キーワード"
        :icon="SearchIcon"
      />

      <div class="tag-container">
        <ElmHeading :level="3" text="タグ一覧" disable-fragment-identifier />
        <div v-if="blogStore.tags" class="tag-pool">
          <BlogTag
            v-for="tag in blogStore.tags"
            :id="tag.id"
            :key="tag.id"
            :label="tag.name"
            :color="tag.color"
            @click="blogStore.tagSelect(tag.id)"
          />
        </div>
      </div>

      <div class="tag-container">
        <ElmHeading
          :level="3"
          text="選択されたタグ"
          disable-fragment-identifier
        />
        <TransitionGroup name="tag" class="tag-pool" tag="dev">
          <BlogTag
            v-for="tag in blogStore.selectedTags"
            :id="tag.id"
            :key="tag.id"
            :label="tag.name"
            :color="tag.color"
            @click="blogStore.tagDeselect(tag.id)"
          />
        </TransitionGroup>
        <ElmButton block @click="blogStore.tagReset">
          <Icon icon="fluent:tag-reset-20-filled" height="20px" />
          選択されたタグのリセット</ElmButton
        >
      </div>

      <ElmHeading :level="3" text="検索結果" disable-fragment-identifier />

      <TransitionGroup name="search" class="search-results" tag="div">
        <div
          v-for="blog in blogStore.searchedBlogs"
          :key="blog.id"
          class="search-results-item"
        >
          <BlogCard
            :id="blog.id"
            :title="blog.title"
            :description="blog.description"
            :tags="blog.tags"
            :created-at="blog.createdAt"
            :updated-at="blog.updatedAt"
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

const SearchIcon = h(Icon, { icon: "material-symbols:search" });

const route = useRoute();
const router = useRouter();

const blogStore = useBlogStore();

const updateQueryParams = () => {
  router.replace({
    query: {
      keyword: blogStore.keyword,
      tags: blogStore.selectedTags.map((tag) => tag.id),
    },
  });
};

const debouncedKeyword = shallowRef<string>("");

watchDebounced(
  debouncedKeyword,
  () => {
    blogStore.keyword = debouncedKeyword.value;
    updateQueryParams();
    blogStore.searchBlog();
  },
  { debounce: 300, maxWait: 3000 }
);

watch(
  () => blogStore.selectedTags,
  () => {
    updateQueryParams();
    blogStore.searchBlog();
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();

  if (blogStore.blogs == null) return;
  if (blogStore.tags == null) return;

  if (typeof route.query?.keyword === "string") {
    debouncedKeyword.value = route.query.keyword;
  }

  if (typeof route.query?.tags === "string") {
    const queryTagId = route.query.tags;

    const queryTags = blogStore.tags.filter((tag) => queryTagId === tag.id);

    blogStore.selectedTags = queryTags;
  } else if (
    typeof route.query?.tags === "object" &&
    route.query.tags != null
  ) {
    const queryTagIds = route.query.tags
      .filter((tagId) => tagId != null)
      .map((tagId) => tagId.toString());

    const queryTags = blogStore.tags.filter((tag) =>
      queryTagIds.includes(tag.id)
    );

    blogStore.selectedTags = queryTags;
  }
  blogStore.searchBlog();
});
</script>

<style lang="scss" scoped>
.tag-container {
  margin-block: 2rem;
}

.tag-pool {
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
