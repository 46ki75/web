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

    <ElmTextField v-model="keyword" label="検索キーワード" :icon="SearchIcon" />

    <h3>POOL</h3>
    <div class="tag-pool" v-if="data">
      <BlogTag
        v-for="tag in data.data.tagList"
        :label="tag.name"
        :color="tag.color"
        @click="handletagSelect(tag)"
      />
    </div>

    <h3>SELECTED</h3>
    <div class="tag-pool" v-if="data">
      <BlogTag
        v-for="tag in selectedTags"
        :label="tag.name"
        :color="tag.color"
        @click="handleTagDeselect(tag)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElmTextField } from "@elmethis/core";
import { Icon } from "@iconify/vue";

interface BlogTag {
  id: string;
  name: string;
  color: string;
}

const config = useRuntimeConfig();

const route = useRoute();
const router = useRouter();

const { data } = useFetch<{
  data: { tagList: Array<BlogTag> };
}>(`${config.public.ENDPOINT}/api/graphql`, {
  method: "POST",
  body: {
    query: /* GraphQL */ `
      {
        tagList {
          id
          name
          color
        }
      }
    `,
  },
});

const queryKeyword =
  typeof route.query?.keyword === "string" ? route.query.keyword : undefined;

const keyword = ref<string | undefined>(queryKeyword);

const queryTagIds =
  typeof route.query?.tags === "object" && route.query.tags != null
    ? route.query.tags
        .filter((tagId) => tagId != null)
        .map((tagId) => tagId.toString())
    : [];

const queryTags =
  data.value != null
    ? data.value?.data.tagList.filter((tag) => queryTagIds.includes(tag.id))
    : [];

const selectedTags = ref<BlogTag[]>(queryTags);

const SearchIcon = h(Icon, { icon: "material-symbols:search" });

const updateQueryParams = () => {
  router.replace({
    query: {
      keyword: keyword.value,
      tags: selectedTags.value.map((tag) => tag.id),
    },
  });
};

const handletagSelect = (tag: BlogTag) => {
  if (!selectedTags.value.some((t) => t.id === tag.id)) {
    selectedTags.value.push(tag);
    updateQueryParams();
  }
};

const handleTagDeselect = (tag: BlogTag) => {
  selectedTags.value = selectedTags.value.filter((t) => t.id !== tag.id);
  updateQueryParams();
};

watch(keyword, () => {
  updateQueryParams();
});
</script>

<style lang="scss" scoped>
.tag-pool {
  display: flex;
}
</style>
