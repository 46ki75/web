import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "deploy-static-aws.py"
SPEC = importlib.util.spec_from_file_location("deploy_static_aws", SCRIPT)
DEPLOY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DEPLOY)


class StaticDeploymentTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name)
        for name, value in {
            "index.html": '<link rel="canonical" href="https://dev-www.ikuma.cloud/">',
            "ja/index.html": "Japanese home",
            "404.html": "Not Found",
            "robots.txt": "robots",
            "sitemap-index.xml": "sitemap",
            "en/blog/index.html": "legacy redirect",
            "ja/about/index.html": "legacy redirect",
            "build/app-hash.js": "bundle",
            "content/media/picture.webp": "image",
            "cache/v3/blog/list/en.json": "separate publisher cache",
            "api/health": "separate API",
        }.items():
            self.write(name, value)

    def write(self, name, value):
        file = self.root / name
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(value, encoding="utf-8")

    def test_routes_are_versioned_and_do_not_override_other_origins(self):
        release, entries = DEPLOY.prepare(self.root, "dev")
        routes = {entry["Key"].removeprefix(f"static:{release}:"): entry["Value"]
                  for entry in entries}
        self.assertEqual(routes["/"], "/index.html")
        self.assertEqual(routes["/ja"], "/ja/index.html")
        self.assertEqual(routes["/en/blog"], "!/blog")
        self.assertEqual(routes["/ja/about/index.html"], "!/ja/")
        self.assertEqual(routes["404"], "Not Found")
        self.assertNotIn("/build/app-hash.js", routes)
        self.assertNotIn("/cache/v3/blog/list/en.json", routes)
        self.assertNotIn("/api/health", routes)
        self.write("cache/v3/blog/list/en.json", "modified publisher cache")
        self.assertEqual(DEPLOY.prepare(self.root, "dev")[0], release)
        self.write("ja/index.html", "new Japanese home")
        self.assertNotEqual(DEPLOY.prepare(self.root, "dev")[0], release)

    def test_wrong_stage_and_oversized_404_are_rejected_before_aws(self):
        with patch.object(DEPLOY, "aws") as aws:
            with self.assertRaisesRegex(ValueError, "https://www.ikuma.cloud/"):
                DEPLOY.upload("prod", self.root, dry_run=False)
            self.write("404.html", "a" * 1025)
            with self.assertRaisesRegex(ValueError, "KeyValueStore limits"):
                DEPLOY.upload("dev", self.root, dry_run=False)
            aws.assert_not_called()

    def test_upload_never_activates_and_activation_checks_readiness(self):
        release, _ = DEPLOY.prepare(self.root, "dev")
        with (patch.object(DEPLOY, "store", return_value="arn:example"),
              patch.object(DEPLOY, "aws"),
              patch.object(DEPLOY, "kvs") as kvs):
            DEPLOY.upload("dev", self.root, dry_run=False)
            self.assertEqual(kvs.call_args.args[-4:], ("--key", f"static:{release}:ready", "--value", "1"))
            self.assertNotIn("static:active", str(kvs.call_args_list))
            kvs.reset_mock()
            DEPLOY.activate("dev", release)
            self.assertEqual([call.args[1] for call in kvs.call_args_list],
                             ["describe-key-value-store", "get-key", "put-key"])
            self.assertEqual(kvs.call_args.args[-4:], ("--key", "static:active", "--value", release))
