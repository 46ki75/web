import { component$, useContext, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./blog-side.scoped.scss?inline";

import { ElmInlineText } from "@elmethis/qwik";
import { Link } from "@builder.io/qwik-city";
import { Date } from "../common/date";
import { BlogContext } from "~/context/blog";
import { Tag } from "../common/tag";

export type BlogSideProps = {
  language: string;
};

export const BlogSide = component$<BlogSideProps>(({ language }) => {
  useStylesScoped$(styles);

  const blogState = useContext(BlogContext);

  return (
    <nav class="blog-side">
      <>
        {blogState.blogMeta?.map((blog, index) => (
          <Link
            key={blog.page_id}
            href={
              language === "en"
                ? `/blog/article/${blog.slug}`
                : `/${language}/blog/article/${blog.slug}`
            }
            style={{ all: "unset" }}
          >
            <div
              class="side-card"
              style={{
                "--delay": `${(index + 1) * 200}ms`,
              }}
            >
              <img
                class="side-card-image"
                src={`/api/v2/blog/${blog.slug}/og-image?lang=${language}`}
                alt={blog.title}
                width={1140}
                height={600}
              />

              <div class="side-card-content">
                <ElmInlineText bold>{blog.title}</ElmInlineText>

                <div class="side-card-content-description">
                  <ElmInlineText size="0.8rem">
                    {blog.description}
                  </ElmInlineText>
                </div>

                <Date createdAt={blog.created_at} updatedAt={blog.updated_at} />
              </div>

              <div class="side-card-tag-container">
                {blogState.tags
                  ?.filter((tag) => blog.tag_ids?.includes(tag.id))
                  .map((tag) => (
                    <Tag
                      key={tag.id}
                      name={language === "ja" ? tag.name_ja : tag.name_en}
                      src={tag.icon_url!}
                    />
                  ))}
              </div>
            </div>
          </Link>
        ))}
      </>
    </nav>
  );
});
