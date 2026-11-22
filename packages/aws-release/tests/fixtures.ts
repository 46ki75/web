import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { TestContext } from "node:test";
import { AwsError } from "../src/aws.ts";

export function fixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), "web-aws-release-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const path = (relative: string) => join(root, relative);
  function write(relative: string, data: string | Buffer) {
    const file = path(relative);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, data);
  }
  return { root, path, write };
}

export function param(args: string[], option: string) {
  const index = args.indexOf(option);
  assert.ok(index >= 0 && index < args.length - 1, `Expected option ${option}`);
  return args[index + 1];
}

export function mockAws(override?: (args: string[]) => string | void) {
  const calls: string[][] = [];
  const keys = new Map<string, string>();
  let revision = 0;
  function bump() {
    revision++;
  }
  async function aws(...args: string[]) {
    calls.push(args);
    const response = override?.(args);
    if (typeof response === "string") return response;
    const [service, operation] = args;
    if (service === "cloudfront" && operation === "list-key-value-stores")
      return "arn:test";
    if (service === "sts" && operation === "get-caller-identity")
      return "owner";
    if (service === "s3" || (service === "s3api" && operation === "put-object"))
      return "";
    assert.equal(service, "cloudfront-keyvaluestore");
    assert.equal(param(args, "--kvs-arn"), "arn:test");
    if (operation === "describe-key-value-store") return `etag-${revision}`;
    if (operation === "get-key") {
      const value = keys.get(param(args, "--key"));
      if (value === undefined)
        throw new AwsError(
          args,
          "An error occurred (ResourceNotFoundException)",
        );
      return value;
    }
    assert.equal(param(args, "--if-match"), `etag-${revision}`, "stale ETag");
    if (operation === "update-keys") {
      const puts = JSON.parse(param(args, "--puts")) as {
        Key: string;
        Value: string;
      }[];
      assert.ok(puts.length > 0 && puts.length <= 50);
      for (const { Key, Value } of puts) keys.set(Key, Value);
    } else {
      assert.equal(operation, "put-key");
      keys.set(param(args, "--key"), param(args, "--value"));
    }
    bump();
    return `etag-${revision}`;
  }
  return { aws, calls, keys, bump };
}
