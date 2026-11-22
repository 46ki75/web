import { fileURLToPath } from "node:url";
import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const stageName = env.STAGE_NAME || process.env.STAGE_NAME || "dev";
  const domain =
    stageName === "prod" ? "www.ikuma.cloud" : `${stageName}-www.ikuma.cloud`;

  return {
    define: {
      "import.meta.env.VITE_API_DOMAIN": JSON.stringify(domain),
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
          // Article metadata and missing-article status must be decided before the response is sent.
          renderMode: "async",
        },
        ssr: true,
        serverFunctions: true,
        extensions: [".jsx", ".tsx"],
      }),
      fileRoutes({ httpMethods: true }),
      {
        name: "web-static-asset-path",
        configEnvironment(name) {
          if (name === "client" || name === "ssr") {
            return {
              build: {
                assetsDir: "build",
              },
            };
          }

          return undefined;
        },
      },
      nitro({ serverEntry: false }),
    ],
    nitro: {
      preset: "aws-lambda",
      devProxy: {
        "/cache/**": {
          target: `https://${domain}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      // Older CSS targets make Lightning CSS replace light-dark() with an OS
      // media query, which ignores runtime color-scheme changes.
      cssTarget: ["chrome123", "firefox120", "safari17.5"],
    },
    server: {
      headers: {
        "Cache-Control": "public, max-age=0",
      },
      proxy: {
        "/api": {
          target: `https://${domain}/api`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/cache": {
          target: `https://${domain}/cache`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cache/, ""),
        },
      },
    },
  };
});
