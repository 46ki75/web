import {
  component$,
  isDev,
  useContextProvider,
  useStore,
} from "@qwik.dev/core";
import { RouterOutlet, useQwikRouter } from "@qwik.dev/router";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";
import "@elmethis/qwik/style.css";

import { BlogContext, BlogState } from "./context/blog";
import { LanguageContext } from "./context/language";

export default component$(() => {
  useQwikRouter();

  const blogState = useStore<BlogState>({
    blogMeta: { en: [], ja: [] },
    tags: [],
    selectedTagIds: [],
  });
  useContextProvider(BlogContext, blogState);

  const languageState = useStore({ language: "en" });
  useContextProvider(LanguageContext, languageState);

  return (
    <>
      <head>
        <meta charset="utf-8" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Zen+Kaku+Gothic+New:wght@300;400;500;700;900&display=swap"
        />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </>
  );
});
