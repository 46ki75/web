/* eslint-disable qwik/jsx-img */
import {
  component$,
  Resource,
  useResource$,
  useStylesScoped$,
} from "@builder.io/qwik";

import styles from "./blog-side.scoped.scss?inline";
import { client } from "../../../openapi/client";
import { ElmInlineText } from "@elmethis/qwik";
import { Link } from "@builder.io/qwik-city";
import { Date } from "../common/date";

export type BlogSideProps = {
  language: string;
};

export const BlogSide = component$<BlogSideProps>(({ language }) => {
  useStylesScoped$(styles);

  const data = useResource$(async () => {
    const { data } = await client.GET("/api/v2/blog", {
      params: {
        header: { "accept-language": language },
      },
    });

    return data;
  });

  return (
    <nav class="blog-side">
      <Resource
        value={data}
        onResolved={(blogs) => (
          <>
            {blogs?.map((blog) => (
              <Link
                key={blog.page_id}
                href={
                  language === "en"
                    ? `/blog/article/${blog.slug}`
                    : `/${language}/blog/article/${blog.slug}`
                }
                style={{ all: "unset" }}
              >
                <div class="side-card">
                  <img
                    src={`/api/v2/blog/${blog.slug}/og-image?lang=${language}`}
                    alt={blog.title}
                  />

                  <div class="side-card-content">
                    <ElmInlineText bold>{blog.title}</ElmInlineText>

                    <div class="side-card-content-description">
                      <ElmInlineText size="0.8rem">
                        {blog.description}
                      </ElmInlineText>
                    </div>

                    <Date
                      createdAt={blog.created_at}
                      updatedAt={blog.updated_at}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}
      />
    </nav>
  );
});
