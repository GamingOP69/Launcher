# Project Overview

The repository contains a Rust/Tauri launcher, React/TypeScript interface, Java Swing preview, a Forge 1.8.9 mod source set, and CI workflows. The Tauri launch path installs Mojang Minecraft and pinned Forge 1.8.9 libraries, bundles the Forge mod, and starts through LaunchWrapper/FMLTweaker using an offline-only profile. Clean package run [38215734080](https://github.com/GamingOP69/Launcher/actions/runs/38215734080) passed actual Forge-backed Minecraft 1.8.9 main-menu/mod initialization under CI-only software OpenGL. The mod includes an informational HUD for FPS, coordinates, facing, movement keys, and sprint state; formatter tests and package startup passed in CI, but in-world rendering/input behavior still needs a real gameplay check. The broader QoL suite is not implemented, and CI does not establish physical GPU rendering or gameplay compatibility.

## Current project principles

1. **CI-first validation:** builds and tests are intended to run in GitHub Actions. No build, test, or packaging has been run on the user's PC for this remediation.
2. **Fair-play scope:** future game-side features are limited to client-side quality-of-life behavior; no anti-cheat bypass or combat assistance.
3. **Account distinction:** local profiles are for offline-mode use only and do not provide credentials for online-mode servers.
4. **Evidence over claims:** performance, server compatibility, and runtime behavior require test evidence. Existing preview values and module descriptions are not live Minecraft telemetry.

See [the remediation ledger](../REMEDIATION_STATUS.md) for findings and current blockers.
