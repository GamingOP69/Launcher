# Project Overview

The repository contains a Rust/Tauri launcher, React/TypeScript interface, Java Swing preview, a Forge 1.8.9 mod source set, and CI workflows. The current Tauri launch path installs Mojang Minecraft and pinned Forge 1.8.9 libraries, bundles the Forge mod, and starts through LaunchWrapper/FMLTweaker using an offline-only profile. Package smoke [38149245534](https://github.com/GamingOP69/Launcher/actions/runs/38149245534) passed actual vanilla Minecraft 1.8.9 window startup under CI-only software OpenGL; it predates the Forge package path. The current Forge package startup still needs successful Actions evidence, and the broader QoL feature suite is not implemented.

## Current project principles

1. **CI-first validation:** builds and tests are intended to run in GitHub Actions. No build, test, or packaging has been run on the user's PC for this remediation.
2. **Fair-play scope:** future game-side features are limited to client-side quality-of-life behavior; no anti-cheat bypass or combat assistance.
3. **Account distinction:** local profiles are for offline-mode use only and do not provide credentials for online-mode servers.
4. **Evidence over claims:** performance, server compatibility, and runtime behavior require test evidence. Existing preview values and module descriptions are not live Minecraft telemetry.

See [the remediation ledger](../REMEDIATION_STATUS.md) for findings and current blockers.
