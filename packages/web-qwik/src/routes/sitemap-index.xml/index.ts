import { RequestHandler } from "@builder.io/qwik-city";
import { SitemapIndexStream, streamToPromise } from "sitemap";

export const onGet: RequestHandler = async (ev) => {
  const stageName = ev.env.get("STAGE_NAME");

  if (!stageName) {
    ev.send(new Response("STAGE_NAME is not set", { status: 500 }));
    return;
  }

  const DOMAIN =
    stageName === "prod" ? "www-ikuma.cloud" : `${stageName}-www.ikuma.cloud`;

  const smis = new SitemapIndexStream();
  smis.write({ url: `https://${DOMAIN}/sitemap.xml` });
  smis.write({ url: `https://${DOMAIN}/api/v2/blog/sitemap.xml` });
  smis.end();

  const xml = await streamToPromise(smis);

  ev.send(
    new Response(xml.toString(), {
      headers: {
        "Content-Type": "application/xml",
      },
    }),
  );
};
