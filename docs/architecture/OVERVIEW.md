# Project Overview

The repository contains a Rust/Tauri launcher, React/TypeScript interface, Java Swing preview, a separate Forge 1.8.9 mod source set, and CI workflows. The Tauri launcher installs Mojang vanilla 1.8.9 and launches it through an offline-only profile. Package smoke [38147574400](https://github.com/GamingOP69/Launcher/actions/runs/38147574400) observed the actual Minecraft window from the installed package under CI software OpenGL, but the workflow failed at its too-short survival wait. A corrected full package smoke is pending. The Forge mod and QoL features are not yet installed by Tauri.

## Current project principles

1. **CI-first validation:** builds and tests are intended to run in GitHub Actions. No build, test, or packaging has been run on the user's PC for this remediation.
2. **Fair-play scope:** future game-side features are limited to client-side quality-of-life behavior; no anti-cheat bypass or combat assistance.
3. **Account distinction:** local profiles are for offline-mode use only and do not provide credentials for online-mode servers.
4. **Evidence over claims:** performance, server compatibility, and runtime behavior require test evidence. Existing preview values and module descriptions are not live Minecraft telemetry.

See [the remediation ledger](../REMEDIATION_STATUS.md) for findings and current blockers.
