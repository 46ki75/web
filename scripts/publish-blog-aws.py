#!/usr/bin/env python3
"""Upload a complete TypeScript snapshot, then activate it separately on CloudFront."""

import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import unicodedata
from urllib.parse import quote
from xml.etree import ElementTree


REGION = "ap-northeast-1"
PREFIX = "cache/v3/blog"
LANGS = ("en", "ja")
MEDIA = f"{PREFIX}/block-image/"
VARIANTS = ("default", "small", "medium", "large")
ASSET = re.compile(r"([0-9a-f]{64})/(default|small|medium|large)")
RELEASE = re.compile(r"[0-9a-f]{24}")
IMMUTABLE = "public, max-age=31536000, immutable"
MUTABLE = "public, max-age=0, s-maxage=31536000"


class AwsError(Exception):
    def __init__(self, args, stderr):
        match = re.search(r"\bAn error occurred \(([^)]*)\)", stderr)
        self.code = match.group(1) if match else None
        operation = " ".join(args[:2])
        super().__init__(f"AWS {operation} failed ({self.code or 'CLI error'})")


def aws(*args):
    out = subprocess.run(["aws", "--region", REGION, "--no-cli-pager", *args],
                         text=True, capture_output=True)
    if out.returncode:
        raise AwsError(args, out.stderr)
    return out.stdout.strip()


@dataclass(frozen=True)
class Blob:
    key: str
    file: Path
    mime: str
    checksum: str

    @property
    def cache_control(self):
        return IMMUTABLE if self.key.startswith(MEDIA) else MUTABLE


def site_origin(stage):
    return "https://www.ikuma.cloud" if stage == "prod" else f"https://{stage}-www.ikuma.cloud"


def slug_ok(slug):
    return (isinstance(slug, str) and slug not in ("", ".", "..")
            and not any(c in "/\\" or unicodedata.category(c) == "Cc" for c in slug))


def prepare(directory, stage):
    """Validate the complete public snapshot before performing any AWS operation."""
    if directory.is_symlink() or not directory.is_dir():
        raise ValueError("Snapshot directory must be a local directory, not a symlink")
    files = {}
    for file in directory.rglob("*"):
        if file.is_symlink() or (not file.is_dir() and not file.is_file()):
            raise ValueError("Snapshot must not contain symlinks or special files")
        if file.is_file():
            files[file.relative_to(directory).as_posix()] = file
    allowed = {}

    def read(key, mime):
        if key not in files:
            raise ValueError(f"Missing snapshot object: {key}")
        data = files[key].read_bytes()
        if mime == "image/webp" and (data[:4] != b"RIFF" or data[8:12] != b"WEBP"):
            raise ValueError(f"Not a WebP object: {key}")
        if mime == "application/xml":
            ElementTree.fromstring(data)
        allowed[key] = Blob(key, files[key], mime, base64.b64encode(hashlib.sha256(data).digest()).decode())
        return data

    media_by_hash = {}

    def image(url):
        if not isinstance(url, str) or not url.startswith("/" + MEDIA):
            raise ValueError("Published images must point to a bundled snapshot object")
        match = ASSET.fullmatch(url[len(MEDIA) + 1:])
        if not match:
            raise ValueError("Invalid content-addressed image key")
        digest, variant = match.groups()
        if digest not in media_by_hash:
            content_hash = hashlib.sha256()
            present = set()
            for name in VARIANTS:
                key = f"{MEDIA}{digest}/{name}"
                if key in files:
                    data = read(key, "image/webp")
                    content_hash.update(f"{name}:{len(data)}:".encode())
                    content_hash.update(data)
                    present.add(name)
            if "default" not in present or content_hash.hexdigest() != digest:
                raise ValueError(f"Image bytes do not match content-derived key: {digest}")
            media_by_hash[digest] = present
        if variant not in media_by_hash[digest]:
            raise ValueError(f"Missing image variant: {digest}/{variant}")

    tags = json.loads(read(f"{PREFIX}/tags.json", "application/json"))
    if not isinstance(tags, list):
        raise ValueError("Invalid tags snapshot")
    tag_ids = {tag["id"] for tag in tags}
    if len(tag_ids) != len(tags):
        raise ValueError("Duplicate tag ID")
    for tag in tags:
        if tag.get("icon_url") is not None:
            image(tag["icon_url"])
    urls = set()
    origin = site_origin(stage)
    for lang in LANGS:
        index = json.loads(read(f"{PREFIX}/list/{lang}.json", "application/json"))
        if not isinstance(index, list) or not index:
            raise ValueError(f"Empty or invalid {lang} article index")
        slugs = set()
        lang_urls = []
        blog_url = origin + ("/ja" if lang == "ja" else "") + "/blog"
        for meta in index:
            slug = meta["slug"]
            if not slug_ok(slug) or slug in slugs or meta["status"] != "Published":
                raise ValueError(f"Invalid, unpublished, or duplicate entry in the {lang} index")
            if not set(meta["tag_ids"]) <= tag_ids:
                raise ValueError(f"Unknown tag in the {lang} index")
            slugs.add(slug)
            encoded_slug = quote(slug, safe="!'()*~")
            lang_urls.append(f"{blog_url}/article/{encoded_slug}")
            article = f"{PREFIX}/article/{slug}"
            read(f"{article}/og-image/{lang}", "image/webp")
            contents = json.loads(read(f"{article}/contents/{lang}.json", "application/json"))
            surface = contents.get("surface") or {}
            components = surface.get("components") or {}
            if contents.get("meta") != meta or surface.get("root") not in components:
                raise ValueError(f"Article metadata or surface does not match index: {lang}/{slug}")
            for component in components.values():
                kind = component.get("component")
                if kind in ("BlockImage", "Icon"):
                    image(component.get("src"))
                    for variant in (component.get("srcset") or "").split(", "):
                        if variant:
                            image(variant.split(" ", 1)[0])
                icon = component.get("icon")
                if kind == "NotionCallout" and icon and icon.get("kind") == "image":
                    image(icon.get("src"))
        feed_key = f"{PREFIX}/feed/json-feed/{lang}.json"
        feed = json.loads(read(feed_key, "application/json"))
        if (feed["home_page_url"] != blog_url or feed["feed_url"] != f"{origin}/{feed_key}"
                or [item["id"] for item in feed["items"]] != lang_urls
                or [item["url"] for item in feed["items"]] != lang_urls):
            raise ValueError(f"Build the snapshot for {origin}; feed does not match its {lang} article index")
        rss = ElementTree.fromstring(read(f"{PREFIX}/feed/rss/{lang}.xml", "application/xml"))
        atom = ElementTree.fromstring(read(f"{PREFIX}/feed/atom/{lang}.xml", "application/xml"))
        if ([node.text for node in rss.findall("./channel/item/link")] != lang_urls
                or [node.text for node in atom.findall("./{http://www.w3.org/2005/Atom}entry/{http://www.w3.org/2005/Atom}id")] != lang_urls):
            raise ValueError(f"RSS/Atom IDs do not match the {lang} article index")
        urls.update(lang_urls)
    sitemap = ElementTree.fromstring(read(f"{PREFIX}/sitemap.xml", "application/xml"))
    if {node.text for node in sitemap.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")} != urls:
        raise ValueError("Sitemap does not match the article indices")
    if set(files) != set(allowed):
        raise ValueError("Snapshot includes unreferenced or unexpected files")
    blobs = sorted(allowed.values(), key=lambda blob: blob.key)
    release = hashlib.sha256()
    for blob in blobs:
        release.update(blob.key.encode() + b"\0" + base64.b64decode(blob.checksum))
    return release.hexdigest()[:24], blobs


def store(stage):
    name = f"{stage}-46ki75-web-cloudfront-kvs-blog-snapshots"
    arn = aws("cloudfront", "list-key-value-stores", "--query",
              f"KeyValueStoreList.Items[?Name==`{name}`].ARN | [0]", "--output", "text")
    if not arn or arn == "None":
        raise ValueError(f"CloudFront blog snapshot store is not provisioned in {stage}")
    return arn


def kvs(arn, action, *args):
    return aws("cloudfront-keyvaluestore", action, "--kvs-arn", arn, *args)


def etag(arn):
    return kvs(arn, "describe-key-value-store", "--query", "ETag", "--output", "text")


def key_value(arn, key):
    return kvs(arn, "get-key", "--key", key, "--query", "Value", "--output", "text")


def get_active(arn):
    try:
        current = key_value(arn, "blog:active")
    except AwsError as error:
        if error.code != "ResourceNotFoundException":
            raise
        return "legacy"
    if current != "legacy" and not RELEASE.fullmatch(current):
        raise ValueError("Invalid active blog release pointer")
    return current


def ensure_blob(bucket, owner, key, blob):
    try:
        aws("s3api", "put-object", "--bucket", bucket, "--expected-bucket-owner", owner,
            "--key", key, "--body", str(blob.file), "--content-type", blob.mime,
            "--cache-control", blob.cache_control, "--checksum-sha256", blob.checksum, "--if-none-match", "*")
    except AwsError as error:
        if error.code != "PreconditionFailed":
            raise
        metadata = json.loads(aws("s3api", "head-object", "--bucket", bucket, "--expected-bucket-owner", owner,
                                  "--key", key, "--checksum-mode", "ENABLED", "--output", "json"))
        if (metadata.get("ChecksumSHA256"), metadata.get("ContentType"), metadata.get("CacheControl")) != (
                blob.checksum, blob.mime, blob.cache_control):
            raise ValueError(f"Existing object conflicts with prepared release: {key}") from None


def upload(stage, directory, dry_run=False):
    release, blobs = prepare(directory, stage)
    print(f"{stage} blog release {release}: {len(blobs)} objects", flush=True)
    if dry_run:
        return release
    arn = store(stage)
    owner = aws("sts", "get-caller-identity", "--query", "Account", "--output", "text")
    bucket = f"{stage}-46ki75-web-s3-bucket-blog-cache"

    def put(blob):
        key = blob.key if blob.key.startswith(MEDIA) else f"blog-releases/{release}/{blob.key}"
        ensure_blob(bucket, owner, key, blob)

    with ThreadPoolExecutor(max_workers=8) as pool:
        for _ in pool.map(put, blobs):
            pass
    kvs(arn, "put-key", "--if-match", etag(arn), "--key", f"blog:{release}:ready", "--value", "1")
    print(f"Prepared {stage} blog release {release}; it is not active yet.")
    return release


def activate(stage, release, expect=None):
    if release != "legacy" and not RELEASE.fullmatch(release):
        raise ValueError("Expected a 24-character release ID or 'legacy'")
    arn = store(stage)
    version = etag(arn)
    before = get_active(arn)
    if expect is not None and before != expect:
        raise ValueError(f"Active blog release changed; found {before}, expected {expect}")
    if release != "legacy" and key_value(arn, f"blog:{release}:ready") != "1":
        raise ValueError("Blog release is not ready")
    if release != before:
        kvs(arn, "put-key", "--if-match", version, "--key", "blog:active", "--value", release)
    print(f"{stage} blog release: {before} -> {release}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("dev", "stg", "prod"), required=True)
    commands = parser.add_subparsers(dest="command", required=True)
    up = commands.add_parser("upload", help="validate and prepare a snapshot without activation")
    up.add_argument("--directory", type=Path, required=True)
    up.add_argument("--dry-run", action="store_true")
    act = commands.add_parser("activate", help="activate a prepared release or roll back")
    act.add_argument("release")
    act.add_argument("--expect", help="refuse to activate if this is no longer the active release")
    commands.add_parser("active", help="print the active release ID")
    args = parser.parse_args()
    os.environ.setdefault("AWS_MAX_ATTEMPTS", "4")
    try:
        if args.command == "upload":
            upload(args.stage, args.directory, args.dry_run)
        elif args.command == "activate":
            activate(args.stage, args.release, args.expect)
        else:
            print(get_active(store(args.stage)))
    except (AwsError, OSError, ValueError, TypeError, AttributeError, KeyError, ElementTree.ParseError) as error:
        if isinstance(error, (TypeError, AttributeError, KeyError, json.JSONDecodeError, ElementTree.ParseError)):
            parser.exit(1, "Invalid snapshot document\n")
        parser.exit(1, f"{error}\n")


if __name__ == "__main__":
    main()
