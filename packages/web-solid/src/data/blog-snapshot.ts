// JSON contract for /cache/v3/blog, produced by the blog publisher (not an HTTP API).
export interface BlogSnapshotEntry {
  page_id: string;
  notion_url: string;
  slug: string;
  featured: boolean;
  tag_ids: string[];
  status: "Draft" | "Archived" | "Private" | "Published";
  title: string;
  description: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface BlogArticleSnapshot {
  meta: BlogSnapshotEntry;
  surface: unknown;
}

export interface BlogTagSnapshot {
  id: string;
  name_en: string;
  name_ja: string;
  icon_url?: string | null;
}
