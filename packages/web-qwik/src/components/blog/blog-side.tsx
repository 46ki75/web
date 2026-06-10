import { $, component$, useContext } from "@qwik.dev/core";

import styles from "./blog-side.module.css";

import { Link, useNavigate } from "@qwik.dev/router";
import { BlogContext } from "~/context/blog";
import { Language } from "~/types";
import { BlogCard } from "./blog-card";
import { ElmButton, ElmInlineText, ElmMdiIcon } from "@elmethis/qwik";
import { mdiBookSearch } from "@mdi/js";

export type BlogSideProps = {
  language: Language;
};

export const BlogSide = component$<BlogSideProps>(({ language }) => {
  const blogState = useContext(BlogContext);
  const nav = useNavigate();

  return (
    <nav class={styles["blog-side"]}>
      <Link
        href={language === "en" ? "/blog/search" : `/${language}/blog/search`}
        aria-label="Search Blogs"
      ></Link>

      <ElmButton
        onClick$={$(() =>
          nav(language === "en" ? "/blog/search" : `/${language}/blog/search`),
        )}
      >
        <ElmMdiIcon d={mdiBookSearch} />
        <ElmInlineText>
          {language === "en" ? "Search Blogs" : "記事を検索"}
        </ElmInlineText>
      </ElmButton>

      {blogState.blogMeta[language]?.map((blog, index) => (
        <BlogCard
          key={blog.page_id}
          blog={blog}
          tags={blogState.tags?.filter((tag) => blog.tag_ids?.includes(tag.id))}
          language={language}
          delay={(index + 1) * 100}
        />
      ))}
    </nav>
  );
});
