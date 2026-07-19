import { Readable } from "node:stream";
import { SitemapStream, streamToPromise } from "sitemap";

import { localizePath, type Locale } from "~/i18n/locale";
import { siteOrigin } from "~/utils/site";

const locales: Locale[] = ["en", "ja"];
const paths = ["/", "/privacy", "/blog"];

export async function GET() {
  const links = paths.flatMap((path) =>
    locales.map((locale) => ({
      url: localizePath(path, locale),
      links: [
        { lang: "x-default", url: localizePath(path, "en") },
        ...locales.map((alternate) => ({
          lang: alternate,
          url: localizePath(path, alternate),
        })),
      ],
    })),
  );
  const stream = new SitemapStream({ hostname: siteOrigin });
  const xml = await streamToPromise(Readable.from(links).pipe(stream));

  return new Response(xml.toString(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
