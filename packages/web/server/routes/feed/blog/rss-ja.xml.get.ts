import { generateBlogFeed } from "~/server/feedUtil";

export default defineEventHandler(async (event) => {
  const feed = await generateBlogFeed("ja");
  const rss2 = feed.rss2();
  setHeader(event, "Content-Type", "application/xml");
  return rss2;
});
