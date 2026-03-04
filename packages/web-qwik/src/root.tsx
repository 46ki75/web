import {
  component$,
  isDev,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.scss";
import "@elmethis/qwik/style.css";

import { BlogContext, BlogState } from "./context/blog";
import { LanguageContext } from "./context/language";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  const blogState = useStore<BlogState>({
    blogMeta: { en: [], ja: [] },
    tags: [],
  });
  useContextProvider(BlogContext, blogState);

  const languageState = useStore({ language: "en" });
  useContextProvider(LanguageContext, languageState);

  return (
    <QwikCityProvider>
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
    </QwikCityProvider>
  );
});
