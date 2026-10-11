# Update integrity and verification

## Current status

The launcher can check a JSON update manifest and compare versions. The configured manifest path currently points to this repository, but no trusted manifest/signature and artifact publication pipeline has been verified. Network, HTTP, and parse errors are reported as “update check unavailable”; they are not treated as “up to date.”

`verify_update_file` computes SHA-256 for an existing local file after canonicalizing both the data root and target to check filesystem containment, then opens the returned canonical target. Regression coverage includes an in-root target, an outside target, a missing target, and a symlink escape on Unix. Path replacement between canonicalization and open remains possible, and this does not provide Windows handle-based reparse-point protection. The helper also does not establish publisher trust, download/stage artifacts, or implement automatic updating. Do not distribute or auto-run updates based on this helper alone.

The schema in [`shared/schemas/update-manifest.schema.json`](../../shared/schemas/update-manifest.schema.json) describes a target format, not a currently published trusted manifest.

## Required before enabling updates

- Publish a versioned manifest for the actual repository with product, platform, architecture, version, exact URL, size, and digest.
- Authenticate the manifest with a signing key whose public key is embedded in the updater; verify signatures before trusting hashes.
- Download to a bounded temporary file, verify size and digest, then atomically replace with rollback.
- Resolve paths safely across symlinks/junctions and reject non-HTTPS or unexpected hosts/redirects.
- Keep update failures distinct from “up to date” and never run self-update from a PR build.
