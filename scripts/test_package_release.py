import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from package_release import package_release


class PackageReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.bundle = self.root / "launcher" / "src-tauri" / "target" / "release" / "bundle"
        (self.bundle / "nsis").mkdir(parents=True)
        (self.bundle / "msi").mkdir(parents=True)

    def tearDown(self):
        self.temp.cleanup()

    def test_stages_only_installers_and_removes_stale_output(self):
        nsis = self.bundle / "nsis" / "Samrat-setup.exe"
        msi = self.bundle / "msi" / "Samrat.msi"
        nsis.write_bytes(b"nsis-installer")
        msi.write_bytes(b"msi-installer")
        stale = self.root / "dist"
        stale.mkdir()
        (stale / "old-client.jar").write_bytes(b"preview jar")
        (stale / "old-setup.exe").write_bytes(b"stale installer")

        result = package_release(self.root)

        self.assertEqual({path.name for path in result}, {"Samrat-setup.exe", "Samrat.msi"})
        self.assertEqual({path.name for path in (self.root / "dist").iterdir()},
                         {"Samrat-setup.exe", "Samrat.msi", "SHA256SUMS.txt", "release-manifest.json"})
        lines = (self.root / "dist" / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines()
        self.assertEqual(len(lines), 2)
        self.assertEqual(
            set(lines),
            {
                f"{hashlib.sha256(b'nsis-installer').hexdigest()}  Samrat-setup.exe",
                f"{hashlib.sha256(b'msi-installer').hexdigest()}  Samrat.msi",
            },
        )
        manifest = json.loads((self.root / "dist" / "release-manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["platform"], "windows-x64")
        self.assertEqual({item["name"] for item in manifest["files"]}, {"Samrat-setup.exe", "Samrat.msi"})
        self.assertTrue(all(item["size"] > 0 and len(item["sha256"]) == 64 for item in manifest["files"]))
        self.assertEqual(
            {item["name"]: item["sha256"] for item in manifest["files"]},
            {
                "Samrat-setup.exe": hashlib.sha256(b"nsis-installer").hexdigest(),
                "Samrat.msi": hashlib.sha256(b"msi-installer").hexdigest(),
            },
        )

    def test_rejects_missing_installer_without_disturbing_previous_output(self):
        dist = self.root / "dist"
        dist.mkdir()
        sentinel = dist / "keep.txt"
        sentinel.write_text("existing output", encoding="utf-8")
        with self.assertRaisesRegex(RuntimeError, "exactly one NSIS"):
            package_release(self.root)
        self.assertEqual(sentinel.read_text(encoding="utf-8"), "existing output")

    def test_rejects_ambiguous_installer_selection(self):
        (self.bundle / "nsis" / "one-setup.exe").write_bytes(b"one")
        (self.bundle / "nsis" / "two-setup.exe").write_bytes(b"two")
        (self.bundle / "msi" / "one.msi").write_bytes(b"msi")
        with self.assertRaisesRegex(RuntimeError, "exactly one NSIS"):
            package_release(self.root)


if __name__ == "__main__":
    unittest.main()
