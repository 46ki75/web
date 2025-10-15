import { fetchBlogList } from "./fetchBlogList";
import { fetchImages } from "./fetchImages";
import { generateBlogFeed } from "./generateBlogFeeds";

export const BLOGS = await fetchBlogList();

const promises = [fetchImages(BLOGS), generateBlogFeed()];

await Promise.all(promises);
