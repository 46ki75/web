#!/usr/bin/env python3
"""Upload and activate a static web release without modifying CloudFront routing."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
REGION = "ap-northeast-1"
RELEASE = re.compile(r"[0-9a-f]{24}", re.ASCII)
IMMUTABLE = "public, max-age=31536000, immutable"


def aws(*arguments):
    return subprocess.check_output(
        ["aws", "--region", REGION, "--no-cli-pager", *arguments], text=True,
    ).strip()


def store(stage):
    name = f"{stage}-46ki75-web-cloudfront-kvs-basic"
    arn = aws("cloudfront", "list-key-value-stores", "--query",
              f"KeyValueStoreList.Items[?Name==`{name}`].ARN | [0]", "--output", "text")
    if arn == "None" or not arn:
        raise ValueError(f"CloudFront key-value store {name} not found")
    return arn


def kvs(arn, command, *arguments):
    return aws("cloudfront-keyvaluestore", command, "--kvs-arn", arn, *arguments)


def etag(arn):
    return kvs(arn, "describe-key-value-store", "--query", "ETag", "--output", "text")


def redirect(path):
    if path == "/about":
        return "/"
    if path == "/ja/about":
        return "/ja/"
    if path == "/en" or path.startswith("/en/"):
        return path[3:] or "/"
    return None


def prepare(directory, stage):
    home = (directory / "index.html").read_text(encoding="utf-8")
    host = f"{stage}-www.ikuma.cloud" if stage != "prod" else "www.ikuma.cloud"
    if f'<link rel="canonical" href="https://{host}/"' not in home:
        raise ValueError(f"Build the static site for https://{host}/ before uploading")
    for required in ("404.html", "ja/index.html", "robots.txt", "sitemap-index.xml"):
        if not (directory / required).is_file():
            raise ValueError(f"Missing required static file: {required}")

    files = sorted(p for p in directory.rglob("*") if p.is_file())
    digest = hashlib.sha256()
    routes = {"404": (directory / "404.html").read_text(encoding="utf-8")}
    for file in files:
        if file.is_symlink():
            raise ValueError(f"Symlinks are not supported: {file}")
        path = "/" + quote(file.relative_to(directory).as_posix(), safe="/")
        if path.startswith(("/api/", "/cache/")):
            continue
        digest.update(path.encode() + b"\0" + hashlib.sha256(file.read_bytes()).digest())
        if path.startswith("/build/"):
            continue
        if path.endswith("/index.html"):
            page = path[:-len("/index.html")] or "/"
            location = redirect(page)
            routes[page] = "!" + location if location else path
            routes[path] = routes[page]
        else:
            routes[path] = path

    release = digest.hexdigest()[:24]
    entries = [{"Key": f"static:{release}:{path}", "Value": value}
               for path, value in sorted(routes.items())]
    if any(len(item["Key"].encode()) > 512 or len(item["Value"].encode()) > 1024 for item in entries):
        raise ValueError("A route or the 404 page exceeds CloudFront KeyValueStore limits")
    return release, entries


def upload(stage, directory, dry_run):
    release, entries = prepare(directory, stage)
    print(f"{stage} release {release}: {len(entries)} static routes and values", flush=True)
    if dry_run:
        return

    arn = store(stage)
    version = etag(arn)
    bucket = f"s3://{stage}-46ki75-web-s3-bucket-web"
    destination = f"{bucket}/site-releases/{release}/"
    aws("s3", "sync", str(directory / "build"), f"{bucket}/build/",
        "--cache-control", IMMUTABLE, "--no-follow-symlinks", "--only-show-errors")
    aws("s3", "cp", str(directory), destination, "--recursive", "--cache-control", "no-cache",
        "--exclude", "api/*", "--exclude", "cache/*", "--exclude", "build/*",
        "--exclude", "content/media/*", "--no-follow-symlinks", "--only-show-errors")
    aws("s3", "cp", str(directory / "content/media"), destination + "content/media/",
        "--recursive", "--cache-control", IMMUTABLE, "--no-follow-symlinks", "--only-show-errors")
    for offset in range(0, len(entries), 50):
        version = kvs(arn, "update-keys", "--if-match", version, "--puts",
                      json.dumps(entries[offset:offset + 50]), "--query", "ETag", "--output", "text")
    # A distinct marker means all S3 uploads and route batches completed.
    kvs(arn, "put-key", "--if-match", version, "--key", f"static:{release}:ready", "--value", "1")
    print(f"Prepared {stage} release {release}; it is not active yet.")


def activate(stage, release):
    if not RELEASE.fullmatch(release):
        raise ValueError("Expected a 24-character release ID")
    arn = store(stage)
    version = etag(arn)
    kvs(arn, "get-key", "--key", f"static:{release}:ready", "--query", "Value", "--output", "text")
    kvs(arn, "put-key", "--if-match", version, "--key", "static:active", "--value", release)
    print(f"Activated {stage} release {release}.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("dev", "stg", "prod"), required=True)
    subparsers = parser.add_subparsers(dest="command", required=True)
    upload_parser = subparsers.add_parser("upload", help="prepare a release without activating it")
    upload_parser.add_argument("--directory", type=Path, default=ROOT / "packages/web-solid/dist/client")
    upload_parser.add_argument("--dry-run", action="store_true", help="validate the artifact locally")
    activate_parser = subparsers.add_parser("activate", help="activate or roll back to a prepared release")
    activate_parser.add_argument("release")
    arguments = parser.parse_args()
    os.environ.setdefault("AWS_MAX_ATTEMPTS", "3")
    try:
        if arguments.command == "upload":
            upload(arguments.stage, arguments.directory, arguments.dry_run)
        else:
            activate(arguments.stage, arguments.release)
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        # A CalledProcessError includes the full command (including route batches).
        parser.exit(1, f"{error if not isinstance(error, subprocess.CalledProcessError) else 'AWS CLI command failed'}\n")


if __name__ == "__main__":
    main()
