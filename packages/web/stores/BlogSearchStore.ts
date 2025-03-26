interface BlogTag {
  id: string;
  name: string;
  color: string;
}

export const useBlogSearchStore = defineStore("BlogSearchStore", {
  state: () => {
    const config = useRuntimeConfig();
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

    return {
      tags: computed(() => data.value?.data.tagList ?? []),
      selectedTags: [] as BlogTag[],
      keyword: undefined as string | undefined,
    };
  },
  actions: {
    tagSelect(tagId: string) {
      const tags = this.tags.filter((tag) => tag.id === tagId);
      if (tags.length === 1) {
        this.selectedTags.push(tags[0]);
      }
    },
    tagDeselect(tagId: string) {
      this.selectedTags = this.selectedTags.filter((tag) => tag.id !== tagId);
    },
    tagReset() {
      this.selectedTags = [];
    },
  },
});
