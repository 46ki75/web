interface Talk {
  url: string;
  title: string;
  description?: string;
  lang: "EN" | "JA";
  image?: string;
  date: string;
  location: {
    en: string;
    ja: string;
  };
}

const SLIDEV_REPOS = [
  {
    owner: "46ki75",
    repo: "lt-aws-dynamodb-arch",
  },
];

const fetchSliDev = async ({
  endpoint,
  owner,
  repo,
}: {
  endpoint: string;
  owner: string;
  repo: string;
}) => {
  const query = /* GraphQL */ `
    query Talk($owner: String!, $repo: String!) {
      talk(owner: $owner, repo: $repo) {
        url
        title
        description
        lang
        image
        date
        location {
          en
          ja
        }
      }
    }
  `;

  const variables = { owner, repo };

  const response: { data: { talk: Talk } } = await $fetch(
    `${endpoint}/api/graphql`,
    {
      method: "POST",
      body: { query, variables },
    }
  );

  return response.data.talk;
};

export const useTalkStore = defineStore("TalkStore", {
  state: () => {
    const config = useAppConfig();

    const { data } = useAsyncData("Talks", async () => {
      const promises = SLIDEV_REPOS.map(({ owner, repo }) =>
        fetchSliDev({ endpoint: config.ENDPOINT, owner, repo })
      );

      const talks = await Promise.all(promises);

      return talks;
    });

    return {
      en: {
        talks: data,
      },
      ja: {
        talks: data,
      },
    };
  },
});
