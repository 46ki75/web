// https://nuxt.com/docs/api/configuration/nuxt-config

import { GTAG, ENDPOINT } from "./scripts/config";
import { client } from "./openapi/client";

const { RUM_IDPOOL_ID, RUM_APP_MONITOR_ID } = await (async () => {
  const { data } = await client.GET("/api/v2/web-config");
  if (data == null) throw new Error("Faild to fetch web config.");
  return {
    RUM_IDPOOL_ID: data.rum_identity_pool_id,
    RUM_APP_MONITOR_ID: data.rum_app_monitor_id,
  };
})();

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  devServer: { host: "127.0.0.1" },
  modules: ["@pinia/nuxt", "@nuxtjs/i18n"],

  i18n: {
    strategy: "prefix_except_default",
    defaultLocale: "en",
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "ja", name: "日本語", file: "ja.json" },
    ],
  },

  runtimeConfig: {
    public: {
      RUM_IDPOOL_ID,
      RUM_APP_MONITOR_ID,
    },
  },
  vite: {
    server: {
      proxy: {
        "/api": {
          target: `${ENDPOINT}/api`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    optimizeDeps: {
      exclude: ["web-image-converter"],
    },
  },

  components: {
    global: true,
    dirs: ["./components"],
  },

  hooks: {},

  app: {
    head: {
      meta: [
        {
          name: "theme-color",
          content: "#cccfd5",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/brand/favicon.svg" },
        {
          rel: "icon",
          type: "image/png",
          href: "/brand/favicon.png",
          sizes: "64x64",
        },
        { rel: "apple-touch-icon", href: "/brand/apple-touch-icon.png" },
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
          src: `https://www.googletagmanager.com/gtag/js?id=${GTAG}`,
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
