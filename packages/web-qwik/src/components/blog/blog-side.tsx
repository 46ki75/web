import { component$, useContext } from "@builder.io/qwik";

import styles from "./blog-side.module.scss";

import { Link } from "@builder.io/qwik-city";
import { BlogContext } from "~/context/blog";
import { Language } from "~/types";
import { BlogCard } from "./blog-card";

export type BlogSideProps = {
  language: Language;
};

export const BlogSide = component$<BlogSideProps>(({ language }) => {
  const blogState = useContext(BlogContext);

  return (
    <nav class={styles["blog-side"]}>
      <Link
        href={language === "en" ? "/blog/search" : `/${language}/blog/search`}
      >
        SEARCH (TODO)
      </Link>

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
