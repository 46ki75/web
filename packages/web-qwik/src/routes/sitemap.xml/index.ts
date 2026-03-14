import { RequestHandler } from "@builder.io/qwik-city";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";

export const onGet: RequestHandler = async (ev) => {
  const stageName = ev.env.get("STAGE_NAME");

  if (!stageName) {
    ev.send(new Response("STAGE_NAME is not set", { status: 500 }));
    return;
  }

  const DOMAIN =
    stageName === "prod" ? "www-ikuma.cloud" : `${stageName}-www.ikuma.cloud`;

  const languages = ["en", "ja"];
  const urls = ["/", "/about", "/privacy", "/blog"];

  const links = urls.flatMap((url) =>
    languages.map((language) => ({
      url: language === "en" ? url : `/${language}${url}`,
      links: languages.map((language) => ({
        lang: language,
        url: language === "en" ? url : `/${language}${url}`,
      })),
    })),
  );

  const stream = new SitemapStream({ hostname: `https://${DOMAIN}` });
  const xml = await streamToPromise(Readable.from(links).pipe(stream));

  ev.send(
    new Response(xml.toString(), {
      headers: {
        "Content-Type": "application/xml",
      },
    }),
  );
};
