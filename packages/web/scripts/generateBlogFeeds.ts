import { Feed } from "feed";
import { ENDPOINT } from "~/scripts/fetchConfig";
import { fetchBlogListEn, fetchBlogListJa } from "~/scripts/fetchBlogList";
import { rm, mkdir, writeFile } from "node:fs/promises";

const generateBlogFeedBase = async (language: "en" | "ja"): Promise<Feed> => {
  const feed = new Feed({
    title: `SrcJar Blog`,
    description: "Updates and articles from SrcJar Blog.",
    id: `${ENDPOINT}${language === "en" ? "" : "/ja"}/blog`,
    link: `${ENDPOINT}${language === "en" ? "" : "/ja"}/blog`,
    language: language,
    favicon: `${ENDPOINT}/brand/favicon.svg`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Ikuma Yamashita`,
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

export const generateBlogFeed = async (): Promise<void> => {
  await rm("./public/feed/blog/", { recursive: true, force: true });
  await mkdir(`./public/feed/blog/`, { recursive: true });

  const languages: Array<"en" | "ja"> = ["en", "ja"];

  for (const language of languages) {
    const feed = await generateBlogFeedBase(language);

    const rss = feed.rss2();
    await writeFile(`./public/feed/blog/rss-${language}.xml`, rss, "utf-8");

    const atom = feed.atom1();
    await writeFile(`./public/feed/blog/atom-${language}.xml`, atom, "utf-8");

    const json1 = feed.json1();
    await writeFile(`./public/feed/blog/feed-${language}.json`, json1, "utf-8");
  }
};
