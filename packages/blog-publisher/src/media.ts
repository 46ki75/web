import { createHash } from "node:crypto";
import { blogCache } from "@web/blog-snapshot";
import type { Surface } from "n2a2ui";
import sharp from "sharp";
import { SnapshotError } from "./notion.ts";

const defaultHosts = new Set([
  "app.notion.com",
  "file.notion.so",
  "images.notionusercontent.com",
  "prod-files-secure.s3.us-west-2.amazonaws.com",
  "s3-us-west-2.amazonaws.com",
  "s3.us-west-2.amazonaws.com",
  "secure.notion-static.com",
  "www.notion.so",
]);
const maxBytes = 20 * 1024 * 1024;
const pixelLimit = 32_000_000;
const variants = [
  ["small", 500],
  ["medium", 800],
  ["large", 1200],
] as const;
export const imagePrefix = `${blogCache}/block-image`;
export type Save = (key: string, data: string | Uint8Array) => Promise<void>;

function hasSignedQuery(url: URL) {
  return [...url.searchParams.keys()].some((key) =>
    /^(x-amz-(?:signature|credential|security-token)|x-goog-signature|signature|expires)$/i.test(
      key,
    ),
  );
}

export function imageDownloader(
  hosts: string[] = [],
  fetcher: typeof fetch = fetch,
) {
  const allowed = new Set([...defaultHosts, ...hosts]);
  return async (input: string): Promise<Buffer> => {
    let url = URL.parse(input);
    const signal = AbortSignal.timeout(30_000);
    for (let hops = 0; hops <= 3; hops++) {
      if (
        !url ||
        url.protocol !== "https:" ||
        url.port ||
        url.username ||
        url.password ||
        !allowed.has(url.hostname)
      ) {
        throw new SnapshotError(
          `Notion media uses a URL outside the HTTPS host allowlist (${url?.hostname ?? "invalid URL"})`,
        );
      }
      let response: Response;
      try {
        response = await fetcher(url, { signal, redirect: "manual" });
      } catch {
        throw new SnapshotError(`Could not fetch media from ${url.hostname}`);
      }
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel().catch(() => {});
        url = location ? URL.parse(location, url) : null;
        continue;
      }
      if (
        !response.ok ||
        !response.body ||
        Number(response.headers.get("content-length")) > maxBytes
      ) {
        await response.body?.cancel().catch(() => {});
        throw new SnapshotError(
          `Cannot download media from ${url.hostname}: HTTP ${response.status} or size limit exceeded`,
        );
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > maxBytes)
            throw new SnapshotError(
              "Notion media exceeds the 20 MiB download limit",
            );
          chunks.push(value);
        }
      } catch (error) {
        await reader.cancel().catch(() => {});
        if (error instanceof SnapshotError) throw error;
        throw new SnapshotError(`Could not read media from ${url.hostname}`);
      } finally {
        reader.releaseLock();
      }
      return Buffer.concat(chunks, size);
    }
    throw new SnapshotError("Notion media redirect limit exceeded");
  };
}

export function snapshotImages(
  save: Save,
  download: ReturnType<typeof imageDownloader>,
) {
  function encode(bytes: Buffer, width?: number) {
    const image = sharp(bytes, { limitInputPixels: pixelLimit }).autoOrient();
    return (width ? image.resize({ width, withoutEnlargement: true }) : image)
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
  }

  async function convert(
    source: string,
    imageRole: "block" | "icon" | "cover",
  ) {
    const input = await download(source);
    try {
      // Rasterize SVGs instead of copying externally sourced XML onto our origin.
      const image = await encode(
        input,
        imageRole === "cover" ? 1200 : imageRole === "icon" ? 192 : undefined,
      );
      const files = [
        { name: "default", width: image.info.width, body: image.data },
      ];
      if (imageRole === "block") {
        for (const [name, width] of variants) {
          if (width >= image.info.width) continue;
          const variant = await encode(input, width);
          files.push({ name, width: variant.info.width, body: variant.data });
        }
      }
      return { files, width: image.info.width, height: image.info.height };
    } catch {
      throw new SnapshotError(
        `Could not convert Notion ${imageRole} image to WebP`,
      );
    }
  }

  const seen = new Map<
    string,
    { src: string; width: number; height: number; srcset?: string }
  >();
  const saved = new Set<string>();
  async function materialize(source: string, role: "block" | "icon") {
    const cacheKey = `${role}:${source}`;
    const existing = seen.get(cacheKey);
    if (existing) return existing;
    const { files, width, height } = await convert(source, role);
    const hash = createHash("sha256");
    for (const { name, body } of files)
      hash.update(`${name}:${body.byteLength}:`).update(body);
    // Existing immutable Rust image URLs cannot be safely overwritten, even if a block ID stays the same.
    const path = `${imagePrefix}/${hash.digest("hex")}`;
    if (!saved.has(path)) {
      for (const { name, body } of files) await save(`${path}/${name}`, body);
      saved.add(path);
    }
    const src = `${path}/default`;
    const srcset =
      files.length > 1
        ? files
            .toSorted((a, b) => a.width - b.width)
            .map(({ name, width }) => `${path}/${name} ${width}w`)
            .join(", ")
        : undefined;
    const result = { src, width, height, srcset };
    seen.set(cacheKey, result);
    return result;
  }

  return {
    async cover(path: string, source: string) {
      const image = await convert(source, "cover");
      await save(path, image.files[0].body);
    },
    async icon(source: string) {
      return (await materialize(source, "icon")).src;
    },
    async surface(surface: Surface) {
      for (const component of surface.components.values()) {
        if (
          component.component === "BlockImage" &&
          typeof component.src === "string"
        ) {
          Object.assign(component, await materialize(component.src, "block"));
          if (component.srcset)
            component.sizes = "(max-width: 800px) 100vw, 800px";
        } else if (
          component.component === "NotionCallout" &&
          component.icon?.kind === "image" &&
          typeof component.icon.src === "string"
        ) {
          component.icon.src = (
            await materialize(component.icon.src, "icon")
          ).src;
        } else if (
          component.component === "Icon" &&
          typeof component.src === "string"
        ) {
          component.src = (await materialize(component.src, "icon")).src;
        } else if (
          component.component === "File" ||
          component.component === "Audio" ||
          component.component === "Video"
        ) {
          const url =
            typeof component.src === "string" ? URL.parse(component.src) : null;
          if (url && (defaultHosts.has(url.hostname) || hasSignedQuery(url))) {
            throw new SnapshotError(
              `Cannot publish a hosted ${component.component} attachment without a durable copy`,
            );
          }
        } else if (
          component.component === "Bookmark" ||
          component.component === "LinkText"
        ) {
          const href =
            component.component === "Bookmark" ? component.url : component.href;
          const url = typeof href === "string" ? URL.parse(href) : null;
          if (url && hasSignedQuery(url))
            throw new SnapshotError(
              "Cannot publish an expiring bookmark or link",
            );
        }
      }
    },
  };
}
