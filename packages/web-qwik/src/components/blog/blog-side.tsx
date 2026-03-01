import {
  component$,
  Resource,
  useResource$,
  useStylesScoped$,
} from "@builder.io/qwik";

import styles from "./blog-side.scoped.scss?inline";
import { client } from "../../../openapi/client";

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
              <div key={blog.page_id} class="side-card">
                {blog.title}
              </div>
            ))}
          </>
        )}
      />
    </nav>
  );
});
