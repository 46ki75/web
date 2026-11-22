import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import {
  lstat,
  mkdir,
  mkdtemp,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { blogCache, isArticleSlug } from "@web/blog-snapshot";
import { type Save } from "./media.ts";
import { SnapshotError } from "./notion.ts";

export function snapshotType(key: string): string | undefined {
  if (!key.startsWith(`${blogCache}/`)) return;
  const parts = key.slice(blogCache.length + 1).split("/");
  const tail = parts.at(-1)!;
  if (parts.length === 4 && parts[0] === "article" && isArticleSlug(parts[1])) {
    if (parts[2] === "contents" && /^(en|ja)\.json$/.test(tail))
      return "application/json";
    if (parts[2] === "og-image" && /^(en|ja)$/.test(tail)) return "image/webp";
  }
  if (
    parts.length === 3 &&
    parts[0] === "block-image" &&
    /^[0-9a-f]{64}$/.test(parts[1]) &&
    /^(default|small|medium|large)$/.test(tail)
  )
    return "image/webp";
  if (parts.length === 3 && parts[0] === "feed") {
    if (["rss", "atom"].includes(parts[1]) && /^(en|ja)\.xml$/.test(tail))
      return "application/xml";
    if (parts[1] === "json-feed" && /^(en|ja)\.json$/.test(tail))
      return "application/json";
  }
  if (parts.length === 2 && parts[0] === "list" && /^(en|ja)\.json$/.test(tail))
    return "application/json";
  if (parts.length === 1 && tail === "tags.json") return "application/json";
  if (parts.length === 1 && tail === "sitemap.xml") return "application/xml";
}

export async function writeSnapshot<T>(
  directory: string,
  run: (save: Save) => Promise<T>,
): Promise<T> {
  const target = resolve(directory);
  const exists = await lstat(target).then(
    () => true,
    (error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
      return false;
    },
  );
  if (exists) throw new SnapshotError("--output must not already exist");
  await mkdir(dirname(target), { recursive: true });
  const scratch = await mkdtemp(join(dirname(target), `.${basename(target)}-`));
  try {
    const result = await run(async (key, data) => {
      if (!snapshotType(key))
        throw new SnapshotError(
          "Snapshot attempted to write an unexpected key",
        );
      const path = join(scratch, key.slice(1));
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, data, { mode: 0o600, flag: "wx" });
    });
    await rename(scratch, target);
    return result;
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

export function snapshotServer(directory: string) {
  return createServer(async (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { allow: "GET, HEAD" }).end();
      return;
    }
    try {
      const key = decodeURIComponent(
        new URL(req.url ?? "", "http://127.0.0.1").pathname,
      );
      const type = snapshotType(key);
      if (type) {
        const path = join(directory, key.slice(1));
        const file = await stat(path);
        if (file.isFile()) {
          res.writeHead(200, {
            "Content-Type": type,
            "Content-Length": file.size,
            "X-Content-Type-Options": "nosniff",
          });
          if (req.method === "HEAD") res.end();
          else
            createReadStream(path)
              .on("error", () => res.destroy())
              .pipe(res);
          return;
        }
      }
    } catch {
      // A malformed path or missing local file is not a snapshot object.
    }
    res.writeHead(404).end();
  });
}
