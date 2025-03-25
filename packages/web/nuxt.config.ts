// https://nuxt.com/docs/api/configuration/nuxt-config

export const STAGE_NAME = process.env.STAGE_NAME;
if (!STAGE_NAME) {
  throw new Error("STAGE_NAME is not set.");
} else if (!["dev", "stg", "prod"].includes(STAGE_NAME)) {
  throw new Error("STAGE_NAME is not valid.");
}

export const ENDPOINT =
  STAGE_NAME === "prod"
    ? `https://www.46ki75.com`
    : `https://${STAGE_NAME}-www.46ki75.com`;

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
});
