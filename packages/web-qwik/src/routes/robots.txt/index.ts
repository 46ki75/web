import type { RequestHandler } from "@builder.io/qwik-city";

const TEMPLATE = (ENDPOINT: string) =>
  `
User-agent: *
Disallow:

Sitemap: ${ENDPOINT}/sitemap-index.xml
`.trim() + "\n";

const stageName = process.env.VITE_STAGE_NAME ?? "dev";
const DOMAIN =
  stageName === "prod" ? "www-ikuma.cloud" : `${stageName}-www.ikuma.cloud`;

export const onGet: RequestHandler = async (ev) => {
  const content = TEMPLATE(`https://${DOMAIN}`);

  ev.send(
    new Response(content, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    }),
  );
};
