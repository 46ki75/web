import { parseArgs } from "node:util";
import { stat } from "node:fs/promises";
import { blogCache } from "@web/blog-snapshot";
import { snapshotServer, writeSnapshot } from "./local.ts";
import { imageDownloader } from "./media.ts";
import { notionSettings, notionSource, SnapshotError } from "./notion.ts";
import { generateSnapshot } from "./snapshot.ts";

const usage = `Usage:
  snapshot --output NEW_DIRECTORY --site-origin HTTPS_ORIGIN [--media-host HOST ...]
  serve --directory SNAPSHOT_DIRECTORY [--port 4174]`;

function options<
  T extends Record<string, { type: "string"; multiple?: boolean }>,
>(args: string[], options: T) {
  try {
    return parseArgs({ args, options });
  } catch {
    throw new SnapshotError(usage);
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "snapshot") {
    const { values } = options(args, {
      output: { type: "string" },
      "site-origin": { type: "string" },
      "media-host": { type: "string", multiple: true },
    });
    const { output, "site-origin": siteOrigin, "media-host": hosts } = values;
    if (!output || !siteOrigin) throw new SnapshotError(usage);
    if (
      hosts?.some(
        (host) => !/^([a-z0-9]+[a-z0-9-]*\.)+[a-z][a-z0-9-]*$/.test(host),
      )
    ) {
      throw new SnapshotError(
        "--media-host must be an exact lowercase DNS host name",
      );
    }
    const source = notionSource(notionSettings(process.env));
    const result = await writeSnapshot(output, (save) =>
      generateSnapshot({
        source,
        siteOrigin,
        save,
        download: imageDownloader(hosts),
      }),
    );
    console.log(
      `Snapshot ready: ${result.en} English articles, ${result.ja} Japanese articles, ${result.tags} tags`,
    );
  } else if (command === "serve") {
    const {
      values: { directory, port: portArg = "4174" },
    } = options(args, {
      directory: { type: "string" },
      port: { type: "string" },
    });
    const port = Number(portArg);
    if (!directory || !/^\d+$/.test(portArg) || !(port > 0 && port < 65536))
      throw new SnapshotError(usage);
    if (
      !(await stat(`${directory}${blogCache}`).then(
        (entry) => entry.isDirectory(),
        () => false,
      ))
    ) {
      throw new SnapshotError("--directory does not contain a blog snapshot");
    }
    snapshotServer(directory)
      .once("error", () => {
        console.error("Cannot listen on the requested loopback port");
        process.exitCode = 1;
      })
      .listen(port, "127.0.0.1", () =>
        console.log(`Serving snapshot at http://127.0.0.1:${port}`),
      );
  } else if (command === "--help" || command === "-h") {
    console.log(usage);
  } else {
    throw new SnapshotError(usage);
  }
}

await main().catch((error: unknown) => {
  console.error(
    error instanceof SnapshotError
      ? error.message
      : "Snapshot command failed (I/O or invalid input)",
  );
  process.exitCode = 1;
});
