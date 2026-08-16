# SAMRAT CLIENT ECOSYSTEM ARCHITECTURE

## High-Level System Architecture

```mermaid
graph TD
    subgraph DesktopApp ["Desktop Launcher (Windows x64)"]
        UI["React 18 + TypeScript UI"] -->|Tauri IPC Invoke| Bridge["Rust Tauri Core Bridge"]
        Bridge --> Auth["Microsoft OAuth2 & Dev Sandbox Auth"]
        Bridge --> JavaMgr["Java Runtime Scanner & Validator"]
        Bridge --> LaunchMgr["Game Launch & Process Supervisor"]
        Bridge --> UpdateMgr["Update Checker & SHA-256 Validator"]
        Bridge --> Storage["Config & Profile JSON Store"]
    end

    subgraph MinecraftRuntime ["Minecraft 1.8.9 Client Runtime"]
        Boot["Bootstrap & Lifecycle"] --> Core["SamratCore"]
        Core --> Bus["Zero-Garbage EventBus"]
        Core --> ModMgr["Module Manager (8 Categories)"]
        Core --> HudEngine["Snap & Drag HUD Engine"]
        Core --> PerfEngine["FastMath & Optimization Engine"]
        Core --> CfgEngine["Versioned Config & Profile Migrations"]
        Core --> DiagMgr["Sanitized Crash & Diagnostic Reporter"]

        ModMgr --> HUD["HUD: FPS, CPS, Ping, Keystrokes, Armor, Potions, Coords"]
        ModMgr --> PVP["PvP: ComboCounter, Crosshair, HitColor, ToggleSprint"]
        ModMgr --> BEDWARS["Bedwars: 8-Team Matrix, Resource Timers, Build Alert"]
        ModMgr --> PERF["Performance: FastMath, Entity Culling, Particle Optimizer"]
        ModMgr --> VISUAL["Visual: MotionBlur, TimeChanger, BlockOverlay, Physics"]
        ModMgr --> PLAYER["Player: 360° Freelook, AutoGG, Chat Customizer"]
    end

    subgraph CloudCI ["GitHub Actions CI/CD"]
        CI1["ci.yml (Matrix Test & Build)"]
        CI2["client-build.yml (Java 8/17/21)"]
        CI3["launcher-build.yml (Windows x64 Tauri)"]
        CI4["windows-release.yml (Installer & SHA-256)"]
        CI5["codeql.yml & dependency-review.yml"]
    end

    LaunchMgr -->|Spawns Java Process with G1GC Args| Boot
```

## System Boundaries & Principles

1. **GitHub-First Toolchain**: Developers do not need any SDKs or compilers installed locally. Clean GitHub-hosted runners handle compilation, testing, static analysis, packaging, and releases.
2. **Strict Legitimacy**: 100% compliant with Minecraft server rules. No KillAura, aim assist, velocity hacks, or authentication bypasses.
3. **Zero Token Leakage**: Passwords and OAuth access tokens are scrubbed from all logs, stack traces, and crash dumps.
4. **Performance by Measurement**: Includes built-in benchmark screens (averages, 1% lows, 0.1% lows, memory allocation) and FastMath lookup tables.
