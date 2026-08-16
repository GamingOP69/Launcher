# SAMRAT CLIENT & LAUNCHER

<div align="center">
  <h3>⚡ Next-Generation Minecraft 1.8.9 PvP, Bedwars & Performance Client Ecosystem ⚡</h3>
  <p>An offline-first, high-performance Minecraft 1.8.9 client paired with a sleek, modern desktop launcher.</p>

  [![Windows Official Release](https://github.com/GamingOP69/Launcher/actions/workflows/windows-release.yml/badge.svg)](https://github.com/GamingOP69/Launcher/actions/workflows/windows-release.yml)
  [![Client Build](https://github.com/GamingOP69/Launcher/actions/workflows/client-build.yml/badge.svg)](https://github.com/GamingOP69/Launcher/actions/workflows/client-build.yml)
  [![Launcher Build](https://github.com/GamingOP69/Launcher/actions/workflows/launcher-build.yml/badge.svg)](https://github.com/GamingOP69/Launcher/actions/workflows/launcher-build.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Target: Minecraft 1.8.9](https://img.shields.io/badge/Minecraft-1.8.9-darkgreen.svg)](https://minecraft.net)
</div>

---

## 🌟 Overview

**SAMRAT CLIENT** is an esports-grade Minecraft 1.8.9 client and desktop launcher engineered for competitive Bedwars, PvP, and maximum framerate stability on modern and low-end PCs.

### Key Pillars
- **Offline-First & Local-First**: Play instantly without mandatory Microsoft login requirements. Create and switch local player profiles with custom skins.
- **One-Click Client Installer**: Automatically downloads and installs the latest verified `samrat-client-1.8.9.jar` directly from GitHub Releases.
- **26+ Custom Java Modules**: Built-in HUD elements, Bedwars 8-team trackers, combo counters, OptiFine Zoom (`C` key), Low Fire, 1.7 Old Animations, and custom vector crosshairs.
- **FastMath Acceleration**: Precomputed 65,536-entry trigonometric lookup tables, Carmack fast inverse square roots, and view frustum entity culling for buttery-smooth FPS.
- **Online Mod Catalog**: 1-click downloader for trusted 1.8.9 Forge addons (OptiFine, Scrollable Tooltips, OldAnimations, AutoTip, MemoryFix).
- **Modern Desktop Launcher**: Built with **Tauri v2 + Rust + React 18 + TypeScript + Tailwind CSS** with system hardware telemetry and real-time process log streaming.

---

## 🏗️ Repository Structure

```
Launcher/
├── .github/
│   └── workflows/             # Windows Release, Client Gradle, Launcher Tauri, CI
├── client/                    # Samrat Minecraft 1.8.9 Client & Core (Java)
│   └── src/main/java/com/samrat/
│       ├── core/              # EventBus, ModuleManager, ConfigManager, ProfileManager
│       ├── module/            # HUD, Bedwars, PvP, Performance, Visual, Player modules
│       ├── gui/               # Interactive Window & Right-Shift ClickGUI
│       └── performance/       # FastMath Table Engine, Entity Culling, Benchmark
├── launcher/                  # Modern Desktop Launcher (Tauri + Rust + React 18)
│   ├── src/                   # React Frontend (Home, Modules, Mods Catalog, Profiles, Settings)
│   └── src-tauri/             # Rust Backend Engine (Process Spawner, Downloader, Java Detector)
└── scripts/                   # Automated packaging & SHA-256 release checksum helpers
```

---

## 🎮 In-Game Controls & Features

| Keybind | Action | Description |
| :--- | :--- | :--- |
| **`[RIGHT-SHIFT]`** | **ClickGUI Menu** | Interactive module configuration menu with live toggles and instant persistence. |
| **`[C]`** | **OptiFine Zoom** | Smooth cinematic FOV magnification with mouse sensitivity dampening. |
| **`[F3]`** | **Toggle HUD** | Shows or hides all on-screen HUD elements with one keystroke. |
| **`[B]`** | **Benchmark** | Runs 100,000 FastMath operations and reports frametime variance in logs. |

---

## 🚀 Built-in Client Modules

### 📊 HUD & Information
- **FPS & Ping Display**: Framerate counter with 1% low frame pacing monitoring.
- **CPS Counter**: Accurate clicks-per-second measurement for LMB and RMB.
- **Keystrokes**: Dynamic overlay lighting up for `W`, `A`, `S`, `D`, `Space`, and Mouse buttons.
- **Armor Durability & Potion Status**: Live durability percentage bars and active potion effect timers.
- **Coordinates & Direction Compass**: Precise XYZ player position, biome, and cardinal direction.

### 🛏️ Bedwars Competitive Suite
- **Bed Status Matrix**: Real-time tracking of all 8 team beds (`Red`, `Blue`, `Green`, `Yellow`, `Aqua`, `White`, `Pink`, `Gray`).
- **Resource Timers**: Diamond & Emerald generator upgrade countdowns and spawn intervals.
- **Height Alert**: Flashes warning when nearing the maximum build limit (Y=256) or void.

### ⚔️ PvP & Visuals
- **Combo Counter**: Tracks consecutive melee hits without damage tick reset.
- **Custom Vector Crosshairs**: Customizable crosshairs with dynamic sprint spread.
- **Low Fire**: Lowers first-person fire rendering overlay so player sightlines remain clear.
- **1.7 Old Animations**: Authentic 1.7 simultaneous block-hitting, sword swings, bow drawing, and rod casting.

---

## 📦 Online Mod Catalog

The launcher includes an integrated **Online Mod Catalog** with 1-click download directly into `%USERPROFILE%/.samrat/game/mods/`:

- **OptiFine 1.8.9 HD U M5** — Performance optimizer, shaders, connected textures, and dynamic lighting.
- **1.7 Old Animations** — Classic blockhit & sword swing animation restoration.
- **Scrollable Tooltips** — Mouse-wheel scrolling for long item lore in shops.
- **AutoTip 1.8.9** — Automatic network booster tipper for Hypixel.
- **MemoryFix 1.8.9** — Fixes 1.8.9 FontRenderer memory leaks.

---

## 🛠️ Automated CI/CD Releases

All release binaries, installers, and client JARs are compiled and packaged automatically via GitHub Actions:

1. **Push with release tag** (e.g. `git tag -a v1.0.15 -m "Release v1.0.15" && git push origin v1.0.15`).
2. GitHub Actions executes:
   - `./gradlew build` to compile the Java client.
   - `npm run tauri build` to compile the Windows `.msi` and `.exe` bundles.
   - `python scripts/package_release.py` to calculate SHA-256 hashes and prepare `dist/`.
   - Publishes official release assets to [GitHub Releases](https://github.com/GamingOP69/Launcher/releases).

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
Minecraft is a trademark of Mojang AB / Microsoft. Samrat Client is an independent third-party client.
