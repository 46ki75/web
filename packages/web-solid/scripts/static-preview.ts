import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import type { Plugin } from "vite";

export function staticPreview(): Plugin {
  return {
    name: "web-static-preview",
    async configurePreviewServer(server) {
      const outDir = resolve(server.config.root, server.config.build.outDir);
      const notFound = await readFile(resolve(outDir, "404.html"));
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const path = `${url.pathname.replace(/\/$/, "")}/index.html`;
        let index: string | undefined;
        try {
          index = resolve(outDir, `.${decodeURIComponent(path)}`);
        } catch {
          // Leave malformed URLs to Vite's static handler.
        }
        if (
          index?.startsWith(outDir + sep) &&
          statSync(index, { throwIfNoEntry: false })?.isFile()
        ) {
          req.url = `${path}${url.search}`;
        }
        next();
      });
      return () => {
        server.middlewares.use((req, res) => {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(req.method === "HEAD" ? undefined : notFound);
        });
      };
    },
  };
}
