import { execFile } from "node:child_process";
import { parseArgs, promisify } from "node:util";

const exec = promisify(execFile);
const stages = ["dev", "stg", "prod"] as const;
export type Stage = (typeof stages)[number];
export type Aws = (...args: string[]) => Promise<string>;
export const immutable = "public, max-age=31536000, immutable";

export function siteOrigin(stage: Stage) {
  return `https://${stage === "prod" ? "www" : `${stage}-www`}.ikuma.cloud`;
}

export function isRelease(value: string) {
  return value.length === 24 && !/[^0-9a-f]/.test(value);
}

export class AwsError extends Error {
  readonly code: string | undefined;

  constructor(args: string[], stderr: string) {
    const code = /\bAn error occurred \(([^)]*)\)/.exec(stderr)?.[1];
    // AWS arguments and stdout can contain manifest values. Report only the operation and error code.
    super(`AWS ${args.slice(0, 2).join(" ")} failed (${code ?? "CLI error"})`);
    this.code = code;
  }
}

export function awsCli(maxAttempts: string): Aws {
  return async (...args) => {
    try {
      const { stdout } = await exec(
        "aws",
        ["--region", "ap-northeast-1", "--no-cli-pager", ...args],
        {
          maxBuffer: 4 * 1024 * 1024,
          env: {
            ...process.env,
            AWS_MAX_ATTEMPTS: process.env.AWS_MAX_ATTEMPTS ?? maxAttempts,
          },
        },
      );
      return stdout.trim();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error("AWS CLI not found on PATH");
      }
      const stderr = (error as { stderr?: string }).stderr ?? "";
      throw new AwsError(args, stderr);
    }
  };
}

export async function releaseStore(
  aws: Aws,
  stage: Stage,
  kind: "blog" | "static",
) {
  const suffix = kind === "blog" ? "blog-snapshots" : "basic";
  const name = `${stage}-46ki75-web-cloudfront-kvs-${suffix}`;
  const arn = await aws(
    "cloudfront",
    "list-key-value-stores",
    "--query",
    `KeyValueStoreList.Items[?Name==\`${name}\`].ARN | [0]`,
    "--output",
    "text",
  );
  if (!arn || arn === "None")
    throw new Error(`CloudFront key-value store ${name} not found`);
  const kvs = (action: string, ...args: string[]) =>
    aws("cloudfront-keyvaluestore", action, "--kvs-arn", arn, ...args);
  const etag = () =>
    kvs("describe-key-value-store", "--query", "ETag", "--output", "text");
  const put = (version: string, key: string, value: string) =>
    kvs("put-key", "--if-match", version, "--key", key, "--value", value);
  const markReady = (version: string, release: string) =>
    put(version, `${kind}:${release}:ready`, "1");
  async function get(key: string) {
    try {
      return await kvs(
        "get-key",
        "--key",
        key,
        "--query",
        "Value",
        "--output",
        "text",
      );
    } catch (error) {
      if (
        error instanceof AwsError &&
        error.code === "ResourceNotFoundException"
      )
        return undefined;
      throw error;
    }
  }
  async function active() {
    const current = await get(`${kind}:active`);
    if (current === undefined) return kind === "blog" ? "legacy" : "none";
    if (!isRelease(current) && !(kind === "blog" && current === "legacy")) {
      throw new Error(`Invalid active ${kind} release pointer`);
    }
    return current;
  }
  async function activate(release: string, expect?: string) {
    // Capture the store ETag first so a concurrent pointer change cannot be silently overwritten.
    const version = await etag();
    const before = await active();
    if (expect !== undefined && before !== expect) {
      throw new Error(
        `Active ${kind} release changed; found ${before}, expected ${expect}`,
      );
    }
    if (
      release !== "legacy" &&
      (await get(`${kind}:${release}:ready`)) !== "1"
    ) {
      throw new Error(
        `${kind === "blog" ? "Blog" : "Static"} release is not ready`,
      );
    }
    if (release !== before) await put(version, `${kind}:active`, release);
    return before;
  }
  return { kvs, etag, markReady, active, activate };
}

export async function releaseCli(options: {
  script: string;
  defaultDirectory?: string;
  upload: (
    stage: Stage,
    directory: string,
    dryRun: boolean,
  ) => Promise<unknown>;
  activate: (stage: Stage, release: string, expect?: string) => Promise<void>;
  active: (stage: Stage) => Promise<string>;
}) {
  const directory = options.defaultDirectory
    ? "[--directory DIRECTORY]"
    : "--directory DIRECTORY";
  const usage = `Usage: node ${options.script} --stage dev|stg|prod <command>
  upload ${directory} [--dry-run]  Prepare without activating
  active                                Print the current release ID
  activate RELEASE_ID [--expect ID]     Activate or roll back`;
  try {
    const {
      values,
      positionals: [command, release, ...extra],
    } = parseArgs({
      allowPositionals: true,
      options: {
        stage: { type: "string" },
        directory: { type: "string" },
        "dry-run": { type: "boolean" },
        expect: { type: "string" },
        help: { type: "boolean", short: "h" },
      },
    });
    if (values.help) {
      console.log(usage);
      return;
    }
    const stage = stages.find((candidate) => candidate === values.stage);
    if (!stage) throw new Error("Specify --stage dev, stg, or prod");
    if (
      command === "upload" &&
      release === undefined &&
      values.expect === undefined
    ) {
      const input = values.directory ?? options.defaultDirectory;
      if (!input) throw new Error("Specify --directory DIRECTORY");
      await options.upload(stage, input, values["dry-run"] === true);
    } else if (
      command === "activate" &&
      release &&
      !extra.length &&
      values.directory === undefined &&
      values["dry-run"] === undefined
    ) {
      await options.activate(stage, release, values.expect);
    } else if (
      command === "active" &&
      release === undefined &&
      values.directory === undefined &&
      values["dry-run"] === undefined &&
      values.expect === undefined
    ) {
      console.log(await options.active(stage));
    } else {
      throw new Error(usage);
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "AWS release command failed",
    );
    process.exitCode = 1;
  }
}
