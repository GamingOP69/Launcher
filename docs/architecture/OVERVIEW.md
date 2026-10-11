# Project Overview

The repository contains a Rust/Tauri launcher, React/TypeScript interface, Java Swing preview, a separate Forge 1.8.9 mod source set, and CI workflows. The Tauri source now contains a Mojang metadata-based vanilla installer and local-profile process launch path. These recent changes are awaiting Actions validation and packaged launcher-driven main-menu evidence. The Forge mod and QoL features are not yet installed by Tauri.

## Current project principles

1. **CI-first validation:** builds and tests are intended to run in GitHub Actions. No build, test, or packaging has been run on the user's PC for this remediation.
2. **Fair-play scope:** future game-side features are limited to client-side quality-of-life behavior; no anti-cheat bypass or combat assistance.
3. **Account distinction:** local profiles are for offline-mode use only and do not provide credentials for online-mode servers.
4. **Evidence over claims:** performance, server compatibility, and runtime behavior require test evidence. Existing preview values and module descriptions are not live Minecraft telemetry.

See [the remediation ledger](../REMEDIATION_STATUS.md) for findings and current blockers.
