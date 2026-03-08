import type { paths } from "../openapi/schema";

export type Language = "en" | "ja";

export type BlogMeta =
  paths["/api/v2/blog/{slug}"]["get"]["responses"]["200"]["content"]["application/json"]["meta"];
