import { solidStart } from "@solidjs/start/config";
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
    plugins: [
      solidStart({ middleware: "src/middleware.ts" }),
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
        },
      },
      nitro({
        preset: "aws-lambda",
        devProxy: {
          "/cache/**": {
            target: `https://${domain}`,
            changeOrigin: true,
          },
        },
      }),
    ],
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
      },
    },
  };
});
