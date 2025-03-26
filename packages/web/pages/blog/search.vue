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
  </div>
</template>

<script lang="ts" setup>
import { ElmTextField } from "@elmethis/core";
import { Icon } from "@iconify/vue";

const route = useRoute();
const router = useRouter();

const keyword = ref<string | undefined>();

const SearchIcon = h(Icon, { icon: "material-symbols:search" });

watch(keyword, (newKeyword) => {
  router.replace({
    query: {
      keyword: newKeyword,
    },
  });
});
</script>
