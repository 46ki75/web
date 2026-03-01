import { createContextId } from "@builder.io/qwik";

import { type paths } from "../../openapi/schema";

export interface BlogState {
  blogMeta: paths["/api/v2/blog"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const BlogContext = createContextId<BlogState>("blog.global");
