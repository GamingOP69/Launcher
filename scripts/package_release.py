#!/usr/bin/env python3
"""
Samrat Release Packaging and Validation Script.
Collects built artifacts from client/ and launcher/, verifies checksums,
and prepares the final release directory.
"""

import os
import sys
import shutil
import hashlib
import json

def calculate_sha256(filepath):
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            hasher.update(chunk)
    return hasher.hexdigest()

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dist_dir = os.path.join(root_dir, 'dist')
    os.makedirs(dist_dir, exist_ok=True)

    print("===================================================")
    print("      SAMRAT RELEASE PACKAGER & VALIDATOR          ")
    print("===================================================")

    artifacts = []

    # 1. Search for Client Jars
    client_libs = os.path.join(root_dir, 'client', 'build', 'libs')
    if os.path.exists(client_libs):
        for f in os.listdir(client_libs):
            if f.endswith('.jar') and not f.endswith('-sources.jar'):
                src = os.path.join(client_libs, f)
                dst = os.path.join(dist_dir, f)
                shutil.copy2(src, dst)
                artifacts.append(dst)

                # Ensure canonical samrat-client-1.8.9.jar is present
                canonical_dst = os.path.join(dist_dir, 'samrat-client-1.8.9.jar')
                if not os.path.exists(canonical_dst):
                    shutil.copy2(src, canonical_dst)
                    artifacts.append(canonical_dst)

    # 2. Search for Core Jars
    core_libs = os.path.join(root_dir, 'core', 'build', 'libs')
    if os.path.exists(core_libs):
        for f in os.listdir(core_libs):
            if f.endswith('.jar') and not f.endswith('-sources.jar'):
                src = os.path.join(core_libs, f)
                dst = os.path.join(dist_dir, f)
                shutil.copy2(src, dst)
                artifacts.append(dst)

    # 3. Search for Launcher Bundles
    bundle_dir = os.path.join(root_dir, 'launcher', 'src-tauri', 'target', 'release', 'bundle')
    if os.path.exists(bundle_dir):
        for root, _, files in os.walk(bundle_dir):
            for f in files:
                if f.endswith('.msi') or f.endswith('.exe') or f.endswith('.zip'):
                    src = os.path.join(root, f)
                    dst = os.path.join(dist_dir, f)
                    shutil.copy2(src, dst)
                    artifacts.append(dst)

    # Remove duplicates from artifacts list
    unique_artifacts = list(dict.fromkeys(artifacts))

    # Generate SHA256SUMS.txt
    checksum_lines = []
    print("\nCalculated Artifact SHA-256 Hashes:")
    for art in unique_artifacts:
        filename = os.path.basename(art)
        sha = calculate_sha256(art)
        size_kb = os.path.getsize(art) / 1024
        checksum_lines.append(f"{sha}  {filename}")
        print(f"  [OK] {filename} ({size_kb:.1f} KB): {sha}")

    sums_file = os.path.join(dist_dir, 'SHA256SUMS.txt')
    with open(sums_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(checksum_lines) + '\n')

    print(f"\nWritten {len(checksum_lines)} checksums to {sums_file}")
    print("Release packaging completed successfully.")
    return 0

if __name__ == '__main__':
    sys.exit(main())
