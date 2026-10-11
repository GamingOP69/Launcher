#!/usr/bin/env python3
"""Stage only supported Windows launcher installers for a stable release."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
from pathlib import Path


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def package_release(root: Path) -> list[Path]:
    root = root.resolve()
    dist = root / "dist"
    bundle = root / "launcher" / "src-tauri" / "target" / "release" / "bundle"
    nsis = sorted((bundle / "nsis").glob("*-setup.exe"))
    msi = sorted((bundle / "msi").glob("*.msi"))
    if len(nsis) != 1:
        raise RuntimeError(f"Expected exactly one NSIS setup executable; found {len(nsis)}.")
    if len(msi) != 1:
        raise RuntimeError(f"Expected exactly one MSI installer; found {len(msi)}.")

    # Resolve and constrain deletion to this repository's exact dist directory.
    if dist.is_symlink() or dist.resolve(strict=False).parent != root or dist.name != "dist":
        raise RuntimeError("Refusing to clean an unexpected release output path.")
    if dist.exists():
        shutil.rmtree(dist)
    dist.mkdir(parents=True)

    staged: list[Path] = []
    for artifact in [*nsis, *msi]:
        destination = dist / artifact.name
        shutil.copy2(artifact, destination)
        staged.append(destination)

    checksum_file = dist / "SHA256SUMS.txt"
    checksum_file.write_text(
        "".join(f"{sha256_file(path)}  {path.name}\n" for path in staged),
        encoding="utf-8",
    )
    manifest = {
        "schemaVersion": 1,
        "product": "Samrat Launcher",
        "version": os.environ.get("GITHUB_REF_NAME", "unversioned"),
        "commit": os.environ.get("GITHUB_SHA"),
        "platform": "windows-x64",
        "files": [
            {"name": path.name, "size": path.stat().st_size, "sha256": sha256_file(path)}
            for path in staged
        ],
    }
    (dist / "release-manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print("Staged stable launcher installers:")
    for path in staged:
        print(f"  {path.name} ({path.stat().st_size} bytes) sha256={sha256_file(path)}")
    print(f"  SHA256SUMS.txt ({len(staged)} installer entries)")
    print("  release-manifest.json")
    return staged


if __name__ == "__main__":
    package_release(Path(__file__).resolve().parent.parent)
