import { $, component$, useContext } from "@builder.io/qwik";

import styles from "./blog-index.module.scss";
import { BlogContext } from "~/context/blog";
import { Language } from "~/types";
import { BlogCard } from "./blog-card";
import { Meta } from "../common/meta";
import { useNavigate } from "@builder.io/qwik-city";
import { ElmHeading, ElmParagraph } from "@elmethis/qwik";

export interface BlogIndexProps {
  language: Language;
}

const translations = {
  en: {
    featured: "Featured",
    recent: "Recent",
    description:
      "This blog primarily publishes articles about software engineering and AWS. I have also started publishing blogs about how to draw illustrations. The types of articles provided may vary depending on the language.",
  },
  ja: {
    featured: "おすすめ",
    recent: "最近の記事",
    description:
      "このブログは主にソフトウェア工学と AWS に関する記事を公開しています。イラストの描き方に関するブログの公開も開始しました。提供される記事の種類は、言語によって異なる場合があります。",
  },
};

export const BlogIndex = component$<BlogIndexProps>(({ language }) => {
  const nav = useNavigate();
  const blogState = useContext(BlogContext);

  return (
    <div class={styles["blog-index"]}>
      <Meta
        title="Blog"
        createdAt="2023-10-01"
        updatedAt="2023-10-01"
        links={[
          {
            text: "Home",
            onClick$: $(() => nav(language === "en" ? "/" : `/${language}`)),
          },
          {
            text: "Blog",
            onClick$: $(() =>
              nav(language === "en" ? "/blog" : `/${language}/blog`),
            ),
          },
        ]}
      />

      <div style={{ "--margin-block": "2rem" }}>
        <ElmParagraph>{translations[language].description}</ElmParagraph>
      </div>

      <ElmHeading
        level={2}
        text={translations[language].featured}
        style={{ "--margin-block": "2rem" }}
      />

      <div class={styles["blog-card-list"]}>
        {blogState.blogMeta[language]
          .filter(({ featured }) => featured)
          .map((blog, index) => (
            <BlogCard
              key={blog.page_id}
              blog={blog}
              tags={blogState.tags?.filter((tag) =>
                blog.tag_ids?.includes(tag.id),
              )}
              language={language}
              delay={(index + 1) * 100}
            ></BlogCard>
          ))}
      </div>

      <ElmHeading
        level={2}
        text={translations[language].recent}
        style={{ "--margin-block": "2rem" }}
      />

      <div class={styles["blog-card-list"]}>
        {blogState.blogMeta[language].slice(0, 3).map((blog, index) => (
          <BlogCard
            key={blog.page_id}
            blog={blog}
            tags={blogState.tags?.filter((tag) =>
              blog.tag_ids?.includes(tag.id),
            )}
            language={language}
            delay={(index + 1) * 100}
          ></BlogCard>
        ))}
      </div>
    </div>
  );
});
