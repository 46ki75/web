import type { RequestHandler } from "@builder.io/qwik-city";

const TEMPLATE = (ENDPOINT: string) =>
  `
User-agent: *
Disallow:

Sitemap: ${ENDPOINT}/sitemap-index.xml
`.trim() + "\n";

export const onGet: RequestHandler = async (ev) => {
  const stageName = ev.env.get("STAGE_NAME");
  const DOMAIN =
    stageName === "prod" ? "www-ikuma.cloud" : `${stageName}-www.ikuma.cloud`;
  const content = TEMPLATE(`https://${DOMAIN}`);

  ev.send(
    new Response(content, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    }),
  );
};
