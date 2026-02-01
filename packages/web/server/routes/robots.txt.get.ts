const TEMPLATE = (ENDPOINT: string) =>
  `
User-agent: *
Disallow: /api/
Allow: /api/v2/blog/sitemap.xml

Sitemap: ${ENDPOINT}/sitemap-index.xml
`.trim() + "\n";

const generateRobots = async (): Promise<string> => {
  const runtimeConfig = useRuntimeConfig();

  console.log("🔧 Generating robots.txt");

  const content = TEMPLATE(runtimeConfig.public.ENDPOINT);

  return content;
};

export default defineEventHandler(async (event) => {
  setHeader(event, "content-type", "text/plain");
  return await generateRobots();
});
