#!/usr/bin/env python3
"""
Generates SHA-256 checksums for release binaries and packages in a directory.
Usage: python generate_checksums.py [dist_folder]
"""

import os
import sys
import hashlib

def calculate_sha256(filepath):
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            sha256.update(chunk)
    return sha256.hexdigest()

def main():
    target_dir = sys.argv[1] if len(sys.argv) > 1 else 'dist'
    if not os.path.exists(target_dir):
        print(f"Directory '{target_dir}' does not exist.")
        return 1

    checksum_file = os.path.join(target_dir, 'SHA256SUMS.txt')
    lines = []

    for filename in sorted(os.listdir(target_dir)):
        if filename == 'SHA256SUMS.txt':
            continue
        filepath = os.path.join(target_dir, filename)
        if os.path.isfile(filepath):
            sha = calculate_sha256(filepath)
            lines.append(f"{sha}  {filename}")
            print(f"[OK] {filename}: {sha}")

    with open(checksum_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    print(f"\nWritten {len(lines)} checksums to {checksum_file}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
