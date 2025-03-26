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

    <div class="tag-container">
      <ElmHeading3 text="タグ一覧" />
      <div class="tag-pool" v-if="data">
        <BlogTag
          v-for="tag in data.data.tagList"
          :id="tag.id"
          :label="tag.name"
          :color="tag.color"
          @click="handletagSelect(tag)"
        />
      </div>
    </div>

    <div class="tag-container" v-if="selectedTags.length > 0">
      <ElmHeading3 text="選択されたタグ" />
      <div class="tag-pool" v-if="data">
        <BlogTag
          v-for="tag in selectedTags"
          :id="tag.id"
          :label="tag.name"
          :color="tag.color"
          @click="handleTagDeselect(tag)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElmHeading3, ElmTextField } from "@elmethis/core";
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

const keyword = ref<string | undefined>();

const selectedTags = ref<BlogTag[]>([]);

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

onMounted(async () => {
  await nextTick();
  if (typeof route.query?.keyword === "string") {
    keyword.value = route.query.keyword;
  }

  if (typeof route.query?.tags === "string") {
    const queryTagId = route.query.tags;

    const queryTags =
      data.value != null
        ? data.value?.data.tagList.filter((tag) => queryTagId === tag.id)
        : [];

    selectedTags.value = queryTags;
  } else if (
    typeof route.query?.tags === "object" &&
    route.query.tags != null
  ) {
    const queryTagIds = route.query.tags
      .filter((tagId) => tagId != null)
      .map((tagId) => tagId.toString());

    const queryTags =
      data.value != null
        ? data.value?.data.tagList.filter((tag) => queryTagIds.includes(tag.id))
        : [];

    selectedTags.value = queryTags;
  }
});
</script>

<style lang="scss" scoped>
.tag-container {
  margin-block: 2rem;
}

.tag-pool {
  display: flex;
}
</style>
