# Installation & Validation Status

The launcher source contains a Mojang metadata-based vanilla 1.8.9 installer and an offline local-profile launch command. Package runs [38147574400](https://github.com/GamingOP69/Launcher/actions/runs/38147574400) and [38148402109](https://github.com/GamingOP69/Launcher/actions/runs/38148402109) installed the package, started Mojang's 1.8.9 main class under Java 8 with CI-only Mesa llvmpipe, and observed the `Minecraft 1.8.9` window. The latest run failed because the launcher did not exit within the 80-second harness wait. The workflow now allows 120 seconds and checks child termination; that retry awaits Actions. Mesa is not included in the product. The `client/` JAR remains a Swing preview. Tauri does not install or launch the separate Forge mod.

Local profiles are stored as identity metadata and launch without an access token; they are for single-player or explicitly offline-mode use and cannot join online-mode servers such as Hypixel. Microsoft account launch is unavailable because secure OS credential storage, token refresh, and complete Microsoft/Xbox/Minecraft session validation are not implemented.

## Current development workflow

1. Use GitHub Actions to build and test. Do not run build, test, or packaging commands on the user's PC.
2. Push a branch or open a pull request. Workflows are configured to validate all branch pushes and pull requests and upload commit-specific artifacts.
3. Inspect the exact run and download artifacts from that run. An Actions artifact is a build output, not a stable release.
4. Stable releases are gated on protected `v*` version tags. Repository tag protection must be configured and verified before relying on this gate.

The Windows package workflow installs Java 8 and verified Mojang runtime files, launches the vanilla 1.8.9 main class through the installed launcher, and checks the process command line, Minecraft window title, bounded survival period, and child-process termination. The previous run observed the real game window but failed in the undersized wait; the corrected retry will provide the next result.

## Release verification still required

Before distributing a client, the remediation must provide evidence for a clean Windows x64 installation, trusted Minecraft/Forge dependency downloads, Microsoft authentication for online-mode play, a launcher-driven Minecraft 1.8.9 main-menu startup, and in-game feature smoke checks. The CI Forge development smoke can validate Forge/game startup under a virtual display, but it does not validate the packaged Tauri launcher. GPU rendering and gameplay checks require a real machine and are not established by compilation alone. Offline local profiles must not be represented as valid for online-mode servers.

See [the remediation ledger](../REMEDIATION_STATUS.md) for current status and exact blockers. The old setup and release instructions should not be used until those release gates are closed.
