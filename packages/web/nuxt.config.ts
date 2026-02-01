// https://nuxt.com/docs/api/configuration/nuxt-config

import { version } from "./package.json";

import { client } from "./openapi/client";

export const STAGE_NAME = process?.env?.STAGE_NAME ?? "dev";

export const ENDPOINT =
  STAGE_NAME === "prod"
    ? `https://www.ikuma.cloud`
    : `https://${STAGE_NAME}-www.ikuma.cloud`;

export const GTAG =
  STAGE_NAME === "prod"
    ? "G-TW1BVM24YT"
    : STAGE_NAME === "stg"
      ? "G-Q7K53RM4VC"
      : "G-85QSG3WH5F";

const { RUM_IDPOOL_ID, RUM_APP_MONITOR_ID } = await (async () => {
  const { data } = await client.GET("/api/v2/web-config", {
    baseUrl: ENDPOINT,
  });
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

  nitro: {
    preset: "aws-lambda",
  },

  routeRules: {
    "/**": {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=31536000",
      },
    },
  },

  i18n: {
    strategy: "prefix_except_default",
    baseUrl: ENDPOINT,
    defaultLocale: "en",
    locales: [
      { code: "en", language: "en", name: "English", file: "en.json" },
      { code: "ja", language: "ja", name: "日本語", file: "ja.json" },
    ],
  },

  appConfig: {
    SITE_NAME: "SrcJar",
    APPLICATION_VERSION: version,
    AWS_PRIMARY_REGION: "ap-northeast-1",
    AWS_GLOBAL_REGION: "us-east-1",
    RUM_IDPOOL_ID,
    RUM_APP_MONITOR_ID,
    STAGE_NAME,
    ENDPOINT,
  },

  runtimeConfig: {
    public: {},
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
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/static/brand/favicon.svg",
        },
        {
          rel: "icon",
          type: "image/png",
          href: "/static/brand/favicon.png",
          sizes: "64x64",
        },
        { rel: "apple-touch-icon", href: "/static/brand/apple-touch-icon.png" },
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
