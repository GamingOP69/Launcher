# Project Overview

The repository contains a Rust/Tauri launcher interface, Java preview/client logic, a separate Forge 1.8.9 mod source set, shared configuration, and CI workflows. The Forge module has not yet passed its build and main-menu smoke job, and the Tauri launcher does not yet install or launch it.

## Current project principles

1. **CI-first validation:** builds and tests are intended to run in GitHub Actions. No build, test, or packaging has been run on the user's PC for this remediation.
2. **Fair-play scope:** future game-side features are limited to client-side quality-of-life behavior; no anti-cheat bypass or combat assistance.
3. **Account distinction:** local profiles are for offline-mode use only and do not provide credentials for online-mode servers.
4. **Evidence over claims:** performance, server compatibility, and runtime behavior require test evidence. Existing preview values and module descriptions are not live Minecraft telemetry.

See [the remediation ledger](../REMEDIATION_STATUS.md) for findings and current blockers.
