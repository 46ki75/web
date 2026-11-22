import { mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import { prerender } from "prerender-crawler/vite";
import { defineConfig, loadEnv, type UserConfig } from "vite";

import { prepareSiteContent } from "./scripts/site-content";
import { staticPreview } from "./scripts/static-preview";

export default defineConfig(
  async ({ mode, isPreview }): Promise<UserConfig> => {
    // Preview only the files that will be deployed, never the SSR build.
    if (isPreview) {
      return {
        appType: "custom",
        build: { outDir: "dist/client" },
        plugins: [staticPreview()],
      };
    }

    const env = loadEnv(mode, process.cwd(), "");
    const stage = env.STAGE_NAME || "prod";
    const defaultOrigin = `https://${stage === "prod" ? "www" : `${stage}-www`}.ikuma.cloud`;
    const siteOrigin = new URL(env.VITE_SITE_URL || defaultOrigin).origin;
    const blogOrigin = new URL(env.BLOG_SNAPSHOT_ORIGIN || defaultOrigin)
      .origin;
    const cacheDir = fileURLToPath(
      new URL("./node_modules/.web-content-", import.meta.url),
    );
    const publicDir = await mkdtemp(cacheDir);
    const cleanup = () => rm(publicDir, { recursive: true, force: true });
    const pages = await prepareSiteContent({
      directory: publicDir,
      siteOrigin,
      blogOrigin,
      badgesSource: env.CREDLY_SNAPSHOT_URL,
    }).catch(async (error: unknown) => {
      await cleanup();
      throw error;
    });

    return {
      publicDir,
      define: {
        "import.meta.env.VITE_SITE_URL": JSON.stringify(siteOrigin),
        "import.meta.env.VITE_SITE_BUILD_DATE": JSON.stringify(
          new Date().toISOString().slice(0, 10),
        ),
      },
      resolve: {
        alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) },
      },
      optimizeDeps: {
        // Elmethis ships JSX for Vite to compile; A2UI's nested CommonJS import still needs prebundling.
        include: ["@elmethis/solid > @a2ui/web_core > validate-color"],
      },
      plugins: [
        solid({
          start: {
            app: "./src/app.tsx",
            middleware: "./src/middleware.ts",
            renderMode: "async",
          },
          ssr: true,
          extensions: [".jsx", ".tsx"],
        }),
        fileRoutes(),
        prerender({
          mode: "static",
          pages,
          crawlLinks: false,
          integrations: [{ name: "clean-content-snapshot", teardown: cleanup }],
        }),
        {
          name: "web-static-content",
          configureServer(server) {
            server.httpServer?.once("close", () => {
              void cleanup().catch((error: unknown) => {
                server.config.logger.warn(
                  `Could not remove snapshot: ${String(error)}`,
                );
              });
            });
          },
          configEnvironment(name) {
            return {
              build: { assetsDir: "build", copyPublicDir: name === "client" },
              ...(name === "ssr" && {
                define: {
                  "import.meta.env.SNAPSHOT_DIR": JSON.stringify(publicDir),
                },
              }),
            };
          },
        },
      ],
      build: {
        // Older CSS targets make Lightning CSS replace light-dark() with an OS
        // media query, which ignores runtime color-scheme changes.
        cssTarget: ["chrome123", "firefox120", "safari17.5"],
      },
    };
  },
);
