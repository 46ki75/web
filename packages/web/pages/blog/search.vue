<template>
  <div>
    <BlogMeta
      title="Search"
      created-at="2022-10-01"
      updated-at="2025-03-26"
      :links="[
        { text: 'Home', href: '/' },
        { text: 'Blog', href: '/blog' },
        { text: 'Search', href: '/search' },
      ]"
    />

    <ElmTextField
      v-model="blogSearchStore.keyword"
      label="検索キーワード"
      :icon="SearchIcon"
    />

    <div class="tag-container">
      <ElmHeading3 text="タグ一覧" />
      <div class="tag-pool" v-if="blogSearchStore.tags">
        <BlogTag
          v-for="tag in blogSearchStore.tags"
          :id="tag.id"
          :label="tag.name"
          :color="tag.color"
          @click="blogSearchStore.tagSelect(tag.id)"
        />
      </div>
    </div>

    <div class="tag-container" v-if="blogSearchStore.selectedTags.length > 0">
      <ElmHeading3 text="選択されたタグ" />
      <div class="tag-pool">
        <BlogTag
          v-for="tag in blogSearchStore.selectedTags"
          :id="tag.id"
          :label="tag.name"
          :color="tag.color"
          @click="blogSearchStore.tagDeselect(tag.id)"
        />
      </div>
      <ElmButton block @click="blogSearchStore.tagReset">
        <Icon icon="fluent:tag-reset-20-filled" height="20px" />
        選択されたタグのリセット</ElmButton
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElmButton, ElmHeading3, ElmTextField } from "@elmethis/core";
import { Icon } from "@iconify/vue";

const SearchIcon = h(Icon, { icon: "material-symbols:search" });

interface BlogTag {
  id: string;
  name: string;
  color: string;
}

const route = useRoute();
const router = useRouter();

const blogSearchStore = useBlogSearchStore();

const updateQueryParams = () => {
  router.replace({
    query: {
      keyword: blogSearchStore.keyword,
      tags: blogSearchStore.selectedTags.map((tag) => tag.id),
    },
  });
};

watch(
  () => blogSearchStore.keyword,
  () => {
    updateQueryParams();
  }
);

onMounted(async () => {
  await nextTick();
  if (typeof route.query?.keyword === "string") {
    blogSearchStore.keyword = route.query.keyword;
  }

  if (typeof route.query?.tags === "string") {
    const queryTagId = route.query.tags;

    const queryTags = blogSearchStore.tags.filter(
      (tag) => queryTagId === tag.id
    );

    blogSearchStore.selectedTags = queryTags;
  } else if (
    typeof route.query?.tags === "object" &&
    route.query.tags != null
  ) {
    const queryTagIds = route.query.tags
      .filter((tagId) => tagId != null)
      .map((tagId) => tagId.toString());

    const queryTags = blogSearchStore.tags.filter((tag) =>
      queryTagIds.includes(tag.id)
    );

    blogSearchStore.selectedTags = queryTags;
  }
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
</style>
