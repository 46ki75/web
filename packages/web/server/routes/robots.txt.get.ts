import { ENDPOINT } from "../../scripts/config";

const TEMPLATE = (ENDPOINT: string) =>
  `
User-agent: *
Disallow:
Sitemap: ${ENDPOINT}/sitemap-index.xml
`.trim() + "\n";

const generateRobots = async (): Promise<string> => {
  console.log("🔧 Generating robots.txt");

  const content = TEMPLATE(ENDPOINT);

  return content;
};

export default defineEventHandler(async (event) => {
  setHeader(event, "content-type", "text/plain");
  return await generateRobots();
});
