// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { localeFromPath } from "~/i18n/locale";

export default createHandler(
  (event) => {
    const locale = localeFromPath(new URL(event.request.url).pathname);

    return (
      <StartServer
        document={({ assets, children, scripts }) => (
          <html lang={locale}>
            <head>
              <meta charset="utf-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossorigin="anonymous"
              />
              <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Zen+Kaku+Gothic+New:wght@300;400;500;700;900&display=swap"
              />
              {assets}
            </head>
            <body>
              <div id="app">{children}</div>
              {scripts}
            </body>
          </html>
        )}
      />
    );
  },
  { mode: "async" },
);
