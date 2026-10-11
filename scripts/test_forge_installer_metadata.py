#!/usr/bin/env python3
"""Verify the pinned Forge 1.8.9 client installer profile used by the launcher."""

from __future__ import annotations

import hashlib
import json
import sys
import urllib.request
import zipfile
from io import BytesIO
from pathlib import Path


INSTALLER_URL = (
    "https://maven.minecraftforge.net/net/minecraftforge/forge/"
    "1.8.9-11.15.1.2318-1.8.9/"
    "forge-1.8.9-11.15.1.2318-1.8.9-installer.jar"
)
INSTALLER_SHA1 = "ec0293ff0776b8831f2ed90511bab76e635dda0c"
FORGE_UNIVERSAL_SHA1 = "aae066917b5a231b7efd1b75653afe52e846ce1f"
MAX_INSTALLER_BYTES = 8 * 1024 * 1024
MAX_FORGE_UNIVERSAL_BYTES = 32 * 1024 * 1024


def inspect_installer() -> dict:
    request = urllib.request.Request(
        INSTALLER_URL,
        headers={"User-Agent": "SamratLauncher-CI/1.0"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        if response.geturl() != INSTALLER_URL:
            raise RuntimeError("Forge installer redirected outside its pinned URL.")
        payload = response.read(MAX_INSTALLER_BYTES + 1)

    if len(payload) > MAX_INSTALLER_BYTES:
        raise RuntimeError("Forge installer exceeded the CI size limit.")
    actual_sha1 = hashlib.sha1(payload).hexdigest()
    if actual_sha1 != INSTALLER_SHA1:
        raise RuntimeError(f"Forge installer SHA-1 mismatch: {actual_sha1}")

    with zipfile.ZipFile(BytesIO(payload)) as archive:
        entries = set(archive.namelist())
        if "install_profile.json" not in entries:
            raise RuntimeError("Pinned Forge installer has no install_profile.json.")
        profile = json.loads(archive.read("install_profile.json"))

    install = profile.get("install")
    version_info = profile.get("versionInfo")
    if not isinstance(install, dict) or not isinstance(version_info, dict):
        raise RuntimeError("Forge installer is not the expected legacy V1 profile format.")
    if version_info.get("mainClass") != "net.minecraft.launchwrapper.Launch":
        raise RuntimeError("Forge profile main class changed from LaunchWrapper.")
    if "net.minecraftforge.fml.common.launcher.FMLTweaker" not in version_info.get(
        "minecraftArguments", ""
    ):
        raise RuntimeError("Forge profile is missing its FMLTweaker launch argument.")
    if not any(
        library.get("name", "").startswith("net.minecraftforge:forge:")
        for library in version_info.get("libraries", [])
        if isinstance(library, dict)
    ):
        raise RuntimeError("Forge profile has no Forge runtime library entry.")

    file_path = install.get("filePath")
    artifact_path = install.get("path")
    if not isinstance(file_path, str) or not file_path.endswith("-universal.jar"):
        raise RuntimeError("Pinned Forge installer does not identify its universal client artifact.")
    if artifact_path != "net.minecraftforge:forge:1.8.9-11.15.1.2318-1.8.9":
        raise RuntimeError("Pinned Forge installer changed its Maven runtime coordinate.")
    universal_url = (
        "https://maven.minecraftforge.net/net/minecraftforge/forge/"
        f"1.8.9-11.15.1.2318-1.8.9/{file_path}"
    )
    with urllib.request.urlopen(
        urllib.request.Request(universal_url, headers={"User-Agent": "SamratLauncher-CI/1.0"}),
        timeout=45,
    ) as response:
        if response.geturl() != universal_url:
            raise RuntimeError("Forge universal artifact redirected outside its pinned URL.")
        universal_bytes = response.read(MAX_FORGE_UNIVERSAL_BYTES + 1)
    if not universal_bytes or len(universal_bytes) > MAX_FORGE_UNIVERSAL_BYTES:
        raise RuntimeError("Forge universal artifact exceeded its supported size.")
    universal_sha1 = hashlib.sha1(universal_bytes).hexdigest()
    if universal_sha1 != FORGE_UNIVERSAL_SHA1:
        raise RuntimeError(f"Forge universal SHA-1 mismatch: {universal_sha1}")

    return {
        "url": INSTALLER_URL,
        "sha1": actual_sha1,
        "profileFormat": "legacy-v1",
        "install": install,
        "versionInfo": version_info,
        "archiveEntries": sorted(
            name
            for name in entries
            if name == "install_profile.json"
            or name == "version.json"
            or name.startswith("maven/net/minecraftforge/forge/")
        ),
        "forgeUniversal": {"url": universal_url, "sha1": universal_sha1, "size": len(universal_bytes)},
    }


def main() -> None:
    output_path = Path(sys.argv[1] if len(sys.argv) > 1 else "forge-client/build/forge-installer-profile.json")
    result = inspect_installer()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(
        "Verified Forge installer profile: "
        f"{result['versionInfo']['id']} ({result['profileFormat']})"
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
