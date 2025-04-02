import { ENDPOINT } from "./fetchConfig";
import { writeFile } from "node:fs/promises";

const TEMPLATE = (ENDPOINT: string) =>
  `
User-agent: *
Disallow:
Sitemap: ${ENDPOINT}/sitemap-index.xml
`.trim() + "\n";

export const generateRobots = async () => {
  console.log("🔧 Generating robots.txt");

  const content = TEMPLATE(ENDPOINT);
  await writeFile("./public/robots.txt", content, "utf-8");

  console.log("🔧 Generating robots.txt ... Done!");
};
