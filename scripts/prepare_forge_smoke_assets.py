#!/usr/bin/env python3
"""Populate ForgeGradle's 1.8.9 asset cache using verified HTTPS downloads.

ForgeGradle 2.1's legacy getAssets task still uses an HTTP asset host. CI uses
this helper and excludes that task so the headless game smoke uses Mojang's
official metadata, HTTPS endpoints, and SHA-1/size checks instead.
"""

import argparse
import hashlib
import json
import os
import re
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path


ALLOWED_HOSTS = {
    "piston-meta.mojang.com",
    "launchermeta.mojang.com",
    "resources.download.minecraft.net",
}
MANIFEST_URL = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
MAX_JSON_BYTES = 8 * 1024 * 1024
MAX_ASSET_BYTES = 256 * 1024 * 1024
MAX_TOTAL_BYTES = 1024 * 1024 * 1024


def fetch_bytes(url: str, max_bytes: int) -> bytes:
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise ValueError("Refusing URL outside the approved Mojang HTTPS hosts")

    request = urllib.request.Request(url, headers={"User-Agent": "SamratForgeSmoke/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        final = urllib.parse.urlparse(response.geturl())
        if final.scheme != "https" or final.hostname not in ALLOWED_HOSTS:
            raise ValueError("Mojang response redirected outside the approved HTTPS hosts")
        data = response.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise ValueError("Mojang metadata response exceeded the configured size limit")
    return data


def json_from_url(url: str, expected_sha1: str | None = None) -> dict:
    data = fetch_bytes(url, MAX_JSON_BYTES)
    if expected_sha1 and hashlib.sha1(data).hexdigest() != expected_sha1.lower():
        raise ValueError("Downloaded metadata SHA-1 did not match Mojang's manifest")
    value = json.loads(data)
    if not isinstance(value, dict):
        raise ValueError("Expected a JSON object from Mojang metadata")
    return value


def download_object(url: str, destination: Path, expected_hash: str, expected_size: int) -> None:
    if not re.fullmatch(r"[0-9a-fA-F]{40}", expected_hash):
        raise ValueError("Asset index contained an invalid SHA-1")
    if expected_size < 0 or expected_size > MAX_ASSET_BYTES:
        raise ValueError("Asset index contained an unsupported asset size")

    if destination.is_file() and destination.stat().st_size == expected_size:
        digest = hashlib.sha1(destination.read_bytes()).hexdigest()
        if digest == expected_hash.lower():
            return

    destination.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "SamratForgeSmoke/1.0"})
    temp_path = None
    digest = hashlib.sha1()
    total = 0
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            final = urllib.parse.urlparse(response.geturl())
            if final.scheme != "https" or final.hostname != "resources.download.minecraft.net":
                raise ValueError("Asset response redirected outside Mojang's HTTPS asset host")
            with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as temp:
                temp_path = Path(temp.name)
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > expected_size or total > MAX_ASSET_BYTES:
                        raise ValueError("Asset response exceeded the size recorded in its index")
                    digest.update(chunk)
                    temp.write(chunk)
        if total != expected_size or digest.hexdigest() != expected_hash.lower():
            raise ValueError("Asset size or SHA-1 did not match Mojang's asset index")
        os.replace(temp_path, destination)
        temp_path = None
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--cache-root",
        type=Path,
        default=Path.home() / ".gradle" / "caches" / "minecraft" / "assets",
        help="ForgeGradle's assets directory (defaults to its standard cache location)",
    )
    args = parser.parse_args()
    cache_root = args.cache_root

    manifest = json_from_url(MANIFEST_URL)
    version = next((item for item in manifest.get("versions", []) if item.get("id") == "1.8.9"), None)
    if not version:
        raise ValueError("Minecraft 1.8.9 was not present in Mojang's version manifest")
    version_json = json_from_url(version["url"], version["sha1"])
    asset_index = version_json["assetIndex"]
    index = json_from_url(asset_index["url"], asset_index["sha1"])

    indexes_dir = cache_root / "indexes"
    indexes_dir.mkdir(parents=True, exist_ok=True)
    index_path = indexes_dir / (asset_index["id"] + ".json")
    index_bytes = json.dumps(index, separators=(",", ":")).encode("utf-8")
    temp_index = index_path.with_suffix(".json.tmp")
    temp_index.write_bytes(index_bytes)
    os.replace(temp_index, index_path)

    objects = index.get("objects")
    if not isinstance(objects, dict):
        raise ValueError("Mojang asset index did not contain an objects map")

    total_expected = 0
    for item in objects.values():
        size = int(item["size"])
        total_expected += size
        if total_expected > MAX_TOTAL_BYTES:
            raise ValueError("Mojang asset index exceeds the total download limit")

    for item in objects.values():
        asset_hash = item["hash"].lower()
        destination = cache_root / "objects" / asset_hash[:2] / asset_hash
        url = f"https://resources.download.minecraft.net/{asset_hash[:2]}/{asset_hash}"
        download_object(url, destination, asset_hash, int(item["size"]))

    print(f"Verified Minecraft 1.8.9 assets: {len(objects)} objects, index {asset_index['id']}")


if __name__ == "__main__":
    main()
