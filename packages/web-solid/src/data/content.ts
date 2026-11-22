export async function readContent<T>(path: string): Promise<T | undefined> {
  if (import.meta.env.SSR) {
    const { readFile } = await import("node:fs/promises");
    try {
      // The browser uses the same URL relative to the static host. On the
      // build server, read the snapshot directly without a second HTTP server.
      const json = await readFile(
        `${import.meta.env.SNAPSHOT_DIR}${decodeURIComponent(path)}`,
        "utf8",
      );
      return JSON.parse(json) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  const response = await fetch(path);
  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function requireContent<T>(path: string): Promise<T> {
  const data = await readContent<T>(path);
  if (data === undefined) {
    throw new Error(`Missing site content: ${path}`);
  }
  return data;
}
