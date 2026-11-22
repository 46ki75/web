import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "publish-blog-aws.py"
SPEC = importlib.util.spec_from_file_location("publish_blog_aws", SCRIPT)
PUBLISH = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = PUBLISH
SPEC.loader.exec_module(PUBLISH)


class BlogPublishTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.origin = PUBLISH.site_origin("dev")
        self.slug = "static%25.post"
        data = b"RIFF\x00\x00\x00\x00WEBP"
        digest = hashlib.sha256(f"default:{len(data)}:".encode() + data).hexdigest()
        self.image = f"block-image/{digest}/default"
        self.write(self.image, data)
        self.write_json("tags.json", [{"id": "tag", "icon_url": f"/{PUBLISH.PREFIX}/{self.image}"}])
        urls = []
        for lang in ("en", "ja"):
            meta = {"slug": self.slug, "status": "Published", "tag_ids": ["tag"]}
            self.write_json(f"list/{lang}.json", [meta])
            article = f"article/{self.slug}"
            self.write_json(f"{article}/contents/{lang}.json", {"meta": meta, "surface": {
                "root": "root", "components": {"root": {"component": "BlockImage", "src": f"/{PUBLISH.PREFIX}/{self.image}"}},
            }})
            self.write(f"{article}/og-image/{lang}", data)
            blog = f"{self.origin}{'/ja' if lang == 'ja' else ''}/blog"
            url = f"{blog}/article/static%2525.post"
            urls.append(url)
            feed = f"feed/json-feed/{lang}.json"
            self.write_json(feed, {
                "home_page_url": blog, "feed_url": f"{self.origin}/{PUBLISH.PREFIX}/{feed}",
                "items": [{"id": url, "url": url}],
            })
            self.write(f"feed/rss/{lang}.xml", f"<rss><channel><item><link>{url}</link></item></channel></rss>")
            self.write(f"feed/atom/{lang}.xml", f'<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>{url}</id></entry></feed>')
        sitemap = "".join(f"<url><loc>{url}</loc></url>" for url in urls)
        self.write("sitemap.xml", f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{sitemap}</urlset>')

    def path(self, key):
        return self.root / PUBLISH.PREFIX / key

    def write(self, key, data):
        target = self.path(key)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data if isinstance(data, bytes) else data.encode())

    def write_json(self, key, data):
        self.write(key, json.dumps(data))

    def test_upload_classifies_assets_and_never_changes_the_active_pointer(self):
        release, blobs = PUBLISH.prepare(self.root, "dev")
        self.assertEqual(len(blobs), 15)
        with patch.object(PUBLISH, "store", return_value="arn"), patch.object(PUBLISH, "etag", return_value="etag"), patch.object(PUBLISH, "aws", return_value="owner"), patch.object(PUBLISH, "ensure_blob") as put, patch.object(PUBLISH, "kvs") as kvs:
            self.assertEqual(PUBLISH.upload("dev", self.root), release)
            keys = {call.args[2]: call.args[3] for call in put.call_args_list}
            self.assertEqual(keys[f"{PUBLISH.PREFIX}/{self.image}"].cache_control, PUBLISH.IMMUTABLE)
            cover = f"blog-releases/{release}/{PUBLISH.PREFIX}/article/{self.slug}/og-image/ja"
            self.assertEqual(keys[cover].mime, "image/webp")
            self.assertEqual(keys[cover].cache_control, PUBLISH.MUTABLE)
            kvs.assert_called_once_with("arn", "put-key", "--if-match", "etag", "--key", f"blog:{release}:ready", "--value", "1")

    def test_wrong_stage_missing_assets_and_extra_files_are_rejected_locally(self):
        with patch.object(PUBLISH, "aws") as aws:
            with self.assertRaisesRegex(ValueError, r"Build the snapshot for https://www.ikuma.cloud"):
                PUBLISH.upload("prod", self.root)
            self.write("unused.txt", "not an artifact")
            with self.assertRaisesRegex(ValueError, "unreferenced or unexpected"):
                PUBLISH.upload("dev", self.root)
            self.path("unused.txt").unlink()
            self.path(self.image).unlink()
            with self.assertRaisesRegex(ValueError, "do not match content-derived key"):
                PUBLISH.upload("dev", self.root)
            aws.assert_not_called()

    def test_conditional_activation_and_rollback(self):
        release = "0123456789ab" * 2
        with patch.object(PUBLISH, "store", return_value="arn"), patch.object(PUBLISH, "etag", return_value="etag"), patch.object(PUBLISH, "get_active", return_value="legacy"), patch.object(PUBLISH, "key_value", return_value="1") as marker, patch.object(PUBLISH, "kvs") as kvs:
            with self.assertRaisesRegex(ValueError, "Active blog release changed"):
                PUBLISH.activate("dev", release, expect="000000000000000000000000")
            PUBLISH.activate("dev", release, expect="legacy")
            marker.assert_called_once_with("arn", f"blog:{release}:ready")
            kvs.assert_called_once_with("arn", "put-key", "--if-match", "etag", "--key", "blog:active", "--value", release)
        with patch.object(PUBLISH, "store", return_value="arn"), patch.object(PUBLISH, "etag", return_value="etag"), patch.object(PUBLISH, "get_active", return_value=release), patch.object(PUBLISH, "key_value") as marker, patch.object(PUBLISH, "kvs") as kvs:
            PUBLISH.activate("dev", "legacy", expect=release)
            marker.assert_not_called()
            kvs.assert_called_once_with("arn", "put-key", "--if-match", "etag", "--key", "blog:active", "--value", "legacy")

    def test_existing_immutable_object_needs_matching_checksum_and_headers(self):
        key = f"{PUBLISH.PREFIX}/{self.image}"
        blob = next(b for b in PUBLISH.prepare(self.root, "dev")[1] if b.key == key)
        conflict = PUBLISH.AwsError(("s3api", "put-object"), "An error occurred (PreconditionFailed)")
        headers = {"ChecksumSHA256": blob.checksum, "ContentType": blob.mime, "CacheControl": blob.cache_control}
        with patch.object(PUBLISH, "aws", side_effect=[conflict, json.dumps(headers)]) as aws:
            PUBLISH.ensure_blob("bucket", "owner", key, blob)
            put = aws.call_args_list[0].args
            self.assertEqual(put[put.index("--if-none-match") + 1], "*")
        with patch.object(PUBLISH, "aws", side_effect=[conflict, json.dumps({**headers, "ChecksumSHA256": "wrong"})]):
            with self.assertRaisesRegex(ValueError, "conflicts with prepared release"):
                PUBLISH.ensure_blob("bucket", "owner", key, blob)


if __name__ == "__main__":
    unittest.main()
