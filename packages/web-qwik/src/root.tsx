import { component$, isDev, useContextProvider, useStore } from "@qwik.dev/core";
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
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </>
  );
});
