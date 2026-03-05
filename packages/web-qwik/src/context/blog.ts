import { createContextId } from "@builder.io/qwik";

import { type paths } from "../../openapi/schema";
import { Language } from "~/types";

export interface BlogState {
  blogMeta: Record<
    Language,
    paths["/api/v2/blog"]["get"]["responses"]["200"]["content"]["application/json"]
  >;

  tags: paths["/api/v2/blog/tag"]["get"]["responses"]["200"]["content"]["application/json"];

  selectedTagIds: string[];
}

export const BlogContext = createContextId<BlogState>("blog.global");
