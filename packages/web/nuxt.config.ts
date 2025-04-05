// https://nuxt.com/docs/api/configuration/nuxt-config

import { ENDPOINT, GTAG, STAGE_NAME } from "./scripts/fetchConfig";
import { fetchPrerenderRoutes } from "./scripts/fetchRoutes";
import { fetchCloudWatchRumConfig } from "./scripts/fetchCloudWatchRumConfig";

const { RUM_IDPOOL_ID, RUM_APP_MONITOR_ID } = await fetchCloudWatchRumConfig();

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    public: {
      STAGE_NAME,
      ENDPOINT,
      RUM_IDPOOL_ID,
      RUM_APP_MONITOR_ID,
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
      routes: await fetchPrerenderRoutes(ENDPOINT),
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
      script: [
        {
          src: "https://www.googletagmanager.com/gtag/js?id=${GTAG}",
          async: true,
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GTAG}');
          `,
          type: "text/javascript",
        },
      ],
    },
  },
});
