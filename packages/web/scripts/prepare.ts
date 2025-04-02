import { fetchBlogList } from "./fetchBlogList";
import { fetchImages } from "./fetchImages";
import { generateRobots } from "./generateRobots";
import { generateSitemap } from "./generateSitemap";

export const BLOGS = await fetchBlogList();

const promises = [fetchImages(BLOGS), generateRobots(), generateSitemap(BLOGS)];

await Promise.all(promises);
