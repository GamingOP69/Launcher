# SAMRAT CLIENT

<div align="center">
  <h3>⚡ Next-Generation Minecraft 1.8.9 PvP, Bedwars & Performance Client Ecosystem ⚡</h3>
  <p>A legitimate, modular, ultra-high-performance Minecraft 1.8.9 client paired with a modern Windows desktop launcher.</p>

  [![CI Pipeline](https://github.com/samrat-client/launcher/actions/workflows/ci.yml/badge.svg)](https://github.com/samrat-client/launcher/actions/workflows/ci.yml)
  [![Client Build](https://github.com/samrat-client/launcher/actions/workflows/client-build.yml/badge.svg)](https://github.com/samrat-client/launcher/actions/workflows/client-build.yml)
  [![Launcher Build](https://github.com/samrat-client/launcher/actions/workflows/launcher-build.yml/badge.svg)](https://github.com/samrat-client/launcher/actions/workflows/launcher-build.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Target: Minecraft 1.8.9](https://img.shields.io/badge/Minecraft-1.8.9-darkgreen.svg)](https://minecraft.net)
</div>

---

## 🌟 Overview

**SAMRAT CLIENT** is an original, legitimate third-party Minecraft 1.8.9 client and launcher suite engineered for competitive PvP, Bedwars, and maximum frame pacing stability on modern and low-end hardware.

### Key Pillars
- **Zero Local Toolchain Requirement**: Developed using a **GitHub-first** workflow. CI/CD runs all builds, tests, and packaging on clean GitHub-hosted runners.
- **Strict Legitimacy**: 100% compliant with server rules and Mojang policies. No cheats, no anti-cheat bypasses, and no cracked account support.
- **Zero-Allocation Core Engine**: Custom zero-garbage `EventBus`, modular lifecycle handlers, and optimized OpenGL state caches.
- **Modern Windows Launcher**: Built with **Tauri + Rust + React 18 + TypeScript** with official Microsoft OAuth2 authentication and SHA-256 verified automatic updates.
- **Sleek Right-Shift ClickGUI & HUD Engine**: Futuristic dark theme, fuzzy search, magnetic snap-to-grid HUD editor, real-time FPS/CPS/Ping/Keystrokes, Bedwars trackers, and performance presets.

---

## 🏗️ Repository Architecture

```
samrat-client/
├── .github/
│   ├── workflows/             # CI, Client Gradle, Launcher Tauri, Release, CodeQL, Nightly
│   └── ISSUE_TEMPLATE/        # Standard GitHub issue and PR templates
├── client/                    # Samrat Minecraft 1.8.9 Client & Core (Java 8)
│   ├── src/main/java/com/samrat/
│   │   ├── core/              # EventBus, ModuleManager, ConfigManager, ProfileManager
│   │   ├── module/            # HUD, PvP, Bedwars, Performance, Visual, Player modules
│   │   ├── hud/               # Magnetic Snap HUD engine & Interactive Editor
│   │   ├── gui/               # Right-Shift ClickGUI, Performance Lab, Profile Manager
│   │   ├── performance/       # FastMath, Entity Culling, Benchmark Engine
│   │   └── diagnostics/       # Sanitized Crash Reporter & Rotating Log Manager
│   └── src/test/java/com/samrat/  # Comprehensive JUnit 5 test suite
├── launcher/                  # Modern Windows Launcher (Tauri + Rust + React 18 + TS)
│   ├── src/                   # React Frontend (Home, Profiles, Accounts, Settings, Logs)
│   └── src-tauri/             # Rust Engine (Process Launcher, MS Auth, Updater, Path Guard)
├── shared/                    # Versioned JSON schemas and shared models
├── docs/                      # Architectural, Security, and Developer Documentation
└── scripts/                   # Automated build & release helpers
```

---

## 🚀 Feature Highlights

### 1. Samrat Core & Module Engine
- **Decoupled Architecture**: 8 distinct categories (`PERFORMANCE`, `HUD`, `PVP`, `BEDWARS`, `VISUAL`, `PLAYER`, `WORLD`, `MISC`).
- **Flexible Settings**: Strongly typed `BooleanSetting`, `NumberSetting`, `ModeSetting`, `ColorSetting`, and `KeybindSetting`.
- **Right-Shift GUI**: Instant fuzzy search across all modules, animated tabs, collapsible category cards, and profile switcher.

### 2. HUD Engine & Interactive Editor
- **Dynamic HUD Elements**: FPS, 1% Lows, Frametime, CPS (Left/Right), Ping, Keystrokes (WASD + LMB/RMB/Space), Armor Durability, Potion Timers, Biome & Coordinates, Direction Compass, Server TPS, Session Clock.
- **Interactive Drag & Snap**: Magnetic alignment guides, fluid scaling, customizable color palettes, background opacity, and boundary containment.

### 3. PvP & Bedwars Informational Utilities
- **PvP Suite**: Hit streak counter, customizable hit color/opacity, dynamic crosshair editor, toggle sprint/sneak status, and legitimate reach display.
- **Bedwars Suite**: Live 8-team bed status matrix, active team player counts, Diamond & Emerald tier upgrade timers, build height warning alert.

### 4. Performance Lab & Optimization Engine
- **Presets**: `QUALITY`, `BALANCED`, `HIGH FPS`, `ULTRA FPS`, `CUSTOM`.
- **Engine Optimizations**: Pre-computed FastMath lookup tables, frustum entity culling, particle lifetime management, off-screen animation pausing, and memory defragmentation.
- **Built-in Benchmark**: Measures Average FPS, Minimum FPS, 1% Lows, 0.1% Lows, Frametime variance (ms), and Memory allocation.

### 5. Samrat Launcher & Security
- **Microsoft Authentication**: Official OAuth2 / Xbox Live flow with secure token persistence.
- **Java Management**: Automatic detection and validation of 64-bit Java runtimes with memory presets (2 GB – 8 GB+) and safe G1GC flags.
- **Diagnostics & Privacy**: Crash reports automatically redact email addresses, tokens, and local file paths.
- **Verified Updates**: Remote manifest downloads verified with SHA-256 checksums before installation.

---

## 🛠️ Build and Development

### GitHub Actions (Recommended)
This repository is configured to build entirely on GitHub-hosted runners. Simply push to your branch or submit a Pull Request to trigger:
- Java Client compile & JUnit 5 test execution
- Rust backend compilation, clippy, and unit tests
- TypeScript strict checking and Vite frontend bundling
- CodeQL security and dependency analysis
- Automated Windows installer packaging and GitHub Releases

### Local Verification (Optional)
If you have local runtimes installed:
```bash
# Test & Build Client
cd client
./gradlew test shadowJar

# Test & Build Launcher
cd launcher
npm install
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## 🔒 Security & Privacy

Samrat Client adheres to strict security standards:
- Passwords are never collected or stored.
- Tokens are encrypted in OS credential storage and scrubbed from all logs.
- All network requests use TLS 1.3.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
Minecraft is a trademark of Mojang AB / Microsoft. Samrat Client is not affiliated with Mojang AB or Microsoft.
