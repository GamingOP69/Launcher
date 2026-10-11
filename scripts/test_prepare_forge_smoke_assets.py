import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import prepare_forge_smoke_assets as assets


class FakeResponse:
    def __init__(self, data, url="https://resources.download.minecraft.net/aa/asset"):
        self.data = data
        self.url = url

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def geturl(self):
        return self.url

    def read(self, size=-1):
        result, self.data = self.data[:size], self.data[size:]
        return result


class ForgeSmokeAssetTests(unittest.TestCase):
    def test_refuses_http_and_unapproved_metadata_hosts(self):
        with self.assertRaises(ValueError):
            assets.fetch_bytes("http://resources.download.minecraft.net/aa/asset", 10)
        with self.assertRaises(ValueError):
            assets.fetch_bytes("https://example.invalid/metadata.json", 10)

    def test_rejects_metadata_with_wrong_manifest_digest(self):
        with patch.object(assets, "fetch_bytes", return_value=b"{}"):
            with self.assertRaisesRegex(ValueError, "SHA-1"):
                assets.json_from_url(assets.MANIFEST_URL, "0" * 40)

    def test_downloads_object_atomically_after_hash_and_size_validation(self):
        data = b"verified test asset"
        expected_hash = hashlib.sha1(data).hexdigest()
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / expected_hash[:2] / expected_hash
            with patch.object(assets.urllib.request, "urlopen", return_value=FakeResponse(data)):
                assets.download_object(
                    f"https://resources.download.minecraft.net/{expected_hash[:2]}/{expected_hash}",
                    destination,
                    expected_hash,
                    len(data),
                )
            self.assertEqual(data, destination.read_bytes())
            self.assertEqual([], list(destination.parent.glob("tmp*")))

    def test_rejects_mismatched_object_without_leaving_partial_file(self):
        data = b"untrusted response"
        expected_hash = hashlib.sha1(b"expected asset").hexdigest()
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / expected_hash[:2] / expected_hash
            with patch.object(assets.urllib.request, "urlopen", return_value=FakeResponse(data)):
                with self.assertRaisesRegex(ValueError, "size or SHA-1"):
                    assets.download_object(
                        f"https://resources.download.minecraft.net/{expected_hash[:2]}/{expected_hash}",
                        destination,
                        expected_hash,
                        len(data),
                    )
            self.assertFalse(destination.exists())
            self.assertEqual([], list(destination.parent.glob("tmp*")))


if __name__ == "__main__":
    unittest.main()
