// https://nuxt.com/docs/api/configuration/nuxt-config

import { fetchArticleRoutes } from "./scripts/fetchArticleRoutes";

export const STAGE_NAME = process.env.STAGE_NAME ?? "dev";

if (!["dev", "stg", "prod"].includes(STAGE_NAME)) {
  throw new Error("STAGE_NAME is not valid.");
}

export const ENDPOINT =
  STAGE_NAME === "prod"
    ? `https://www.46ki75.com`
    : `https://${STAGE_NAME}-www.46ki75.com`;

const routes = await fetchArticleRoutes(ENDPOINT);

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    public: {
      STAGE_NAME,
      ENDPOINT,
    },
  },
  vite: {
    server: {
      proxy: {
        "^/api/.*": {
          target: `${ENDPOINT}/api`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  },
  nitro: {
    prerender: {
      routes: [...routes, "/", "/blog", "/blog/article", "/blog/search"],
      crawlLinks: false,
      concurrency: 10,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "ja" },
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap",
        },
      ],
    },
  },
});
