import { createContextId } from "@builder.io/qwik";

export interface BlogState {
  count: number;
}

export const BlogContext = createContextId<BlogState>("blog.global");
