import { fetchBlogList } from "./fetchBlogList";
import { fetchImages } from "./fetchImages";
import { fetchPrerenderRoutes } from "./fetchRoutes";
import { generateBlogFeed } from "./generateBlogFeeds";
import { generateRobots } from "./generateRobots";
import { generateSitemap } from "./generateSitemap";

export const BLOGS = await fetchBlogList();
const routes = await fetchPrerenderRoutes();

const promises = [
  fetchImages(BLOGS),
  generateBlogFeed(),
  generateRobots(),
  generateSitemap(routes),
];

await Promise.all(promises);
