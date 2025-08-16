import { Feed } from "feed";
import { ENDPOINT } from "~/scripts/fetchConfig";
import { fetchBlogListEn, fetchBlogListJa } from "~/scripts/fetchBlogList";

export const generateBlogFeed = async (
  language: "en" | "ja"
): Promise<Feed> => {
  const feed = new Feed({
    title: `SrcJar Blog`,
    description: "Blog by Ikuma Yamashita.",
    id: "https://example.com/",
    link: "https://example.com/",
    language: language,
    favicon: `${ENDPOINT}/brand/favicon.svg`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Shirayuki`,
    updated: new Date(),
    author: {
      name: "Ikuma Yamashita",
      email: "me@ikuma.cloud",
      link: `${ENDPOINT}${language === "en" ? "" : "/ja"}/about`,
    },
  });

  const blogList =
    language === "en" ? await fetchBlogListEn() : await fetchBlogListJa();

  for (const blog of blogList) {
    const href = `${ENDPOINT}${language === "en" ? "" : "/ja"}/blog/article/${
      blog.id
    }`;

    feed.addItem({
      title: blog.title,
      id: href,
      link: href,
      description: blog.description,
      content: blog.description,
      date: new Date(blog.updatedAt),
      author: [
        {
          name: "Ikuma Yamashita",
          email: "me@ikuma.cloud",
        },
      ],
    });
  }

  return feed;
};
