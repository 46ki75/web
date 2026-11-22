import { createHash } from "node:crypto";
import { lstatSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

export function listFiles(directory: string) {
  const root = resolve(directory);
  if (!lstatSync(root).isDirectory()) {
    throw new Error("Expected an artifact directory, not a symlink or file");
  }
  const files = new Map<string, string>();
  function walk(directory: string, prefix: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      const key = prefix + entry.name;
      if (entry.isDirectory()) walk(path, `${key}/`);
      else if (entry.isFile()) files.set(key, path);
      else
        throw new Error("Artifacts must not contain symlinks or special files");
    }
  }
  walk(root, "");
  return files;
}

// Preserve the Python publisher's Unicode code-point order, independent of locale.
export function sortedKeys(files: ReadonlyMap<string, unknown>) {
  return [...files.keys()].sort((a, b) =>
    Buffer.compare(Buffer.from(a), Buffer.from(b)),
  );
}

export function sha256(data: Buffer) {
  return createHash("sha256").update(data).digest();
}
