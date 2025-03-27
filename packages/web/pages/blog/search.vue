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
        v-model="blogStore.keyword"
        label="検索キーワード"
        :icon="SearchIcon"
      />

      <div class="tag-container">
        <ElmHeading3 text="タグ一覧" disable-fragment-identifier />
        <div class="tag-pool" v-if="blogStore.tags">
          <BlogTag
            v-for="tag in blogStore.tags"
            :key="tag.id"
            :id="tag.id"
            :label="tag.name"
            :color="tag.color"
            @click="blogStore.tagSelect(tag.id)"
          />
        </div>
      </div>

      <div class="tag-container" v-if="blogStore.selectedTags.length > 0">
        <ElmHeading3 text="選択されたタグ" disable-fragment-identifier />
        <div class="tag-pool">
          <BlogTag
            v-for="tag in blogStore.selectedTags"
            :key="tag.id"
            :id="tag.id"
            :label="tag.name"
            :color="tag.color"
            @click="blogStore.tagDeselect(tag.id)"
          />
        </div>
        <ElmButton block @click="blogStore.tagReset">
          <Icon icon="fluent:tag-reset-20-filled" height="20px" />
          選択されたタグのリセット</ElmButton
        >
      </div>

      <TransitionGroup name="search" class="search-results" tag="div">
        <div
          class="search-results-item"
          v-for="blog in blogStore.searchedBlogs"
          :key="blog.id"
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
import { ElmButton, ElmHeading3, ElmTextField } from "@elmethis/core";
import { Icon } from "@iconify/vue";

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

watch(
  () => blogStore.keyword,
  () => {
    updateQueryParams();
    blogStore.searchBlog();
  }
);

interface BlogTag {
  id: string;
  name: string;
  color: string;
}

interface Blog {
  id: string;
  title: string;
  description: string;
  tags: Array<BlogTag>;
  createdAt: string;
  updatedAt: string;
}

onMounted(async () => {
  await nextTick();

  if (blogStore.blogs == null) return;
  if (blogStore.tags == null) return;

  if (typeof route.query?.keyword === "string") {
    blogStore.keyword = route.query.keyword;
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
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-results-item {
  transition: flex 0.3s;
}

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
</style>
