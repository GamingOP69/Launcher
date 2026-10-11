# Installation & Validation Status

The launcher source now contains a Mojang metadata-based vanilla 1.8.9 installer and a local-profile launch command, but the latest code still needs Actions validation and a packaged Tauri-to-Minecraft main-menu smoke before release. The `client/` JAR remains a Swing preview. A separate Forge development smoke reached the Minecraft 1.8.9 main menu under software OpenGL in [Actions run 38138523392](https://github.com/GamingOP69/Launcher/actions/runs/38138523392), but Tauri does not install or launch that Forge mod.

Local profiles are stored as identity metadata and launch without an access token; they are for single-player or explicitly offline-mode use and cannot join online-mode servers such as Hypixel. Microsoft account launch is unavailable because secure OS credential storage, token refresh, and complete Microsoft/Xbox/Minecraft session validation are not implemented.

## Current development workflow

1. Use GitHub Actions to build and test. Do not run build, test, or packaging commands on the user's PC.
2. Push a branch or open a pull request. Workflows are configured to validate all branch pushes and pull requests and upload commit-specific artifacts.
3. Inspect the exact run and download artifacts from that run. An Actions artifact is a build output, not a stable release.
4. Stable releases are gated on protected `v*` version tags. Repository tag protection must be configured and verified before relying on this gate.

The Windows package workflow's clean-runner NSIS install/startup/uninstall smoke passed on commit [`9c1a234`](https://github.com/GamingOP69/Launcher/actions/runs/38139070914). It validates launcher process startup only and does not install or launch Minecraft.

## Release verification still required

Before distributing a client, the remediation must provide evidence for a clean Windows x64 installation, trusted Minecraft/Forge dependency downloads, Microsoft authentication for online-mode play, a launcher-driven Minecraft 1.8.9 main-menu startup, and in-game feature smoke checks. The CI Forge development smoke can validate Forge/game startup under a virtual display, but it does not validate the packaged Tauri launcher. GPU rendering and gameplay checks require a real machine and are not established by compilation alone. Offline local profiles must not be represented as valid for online-mode servers.

See [the remediation ledger](../REMEDIATION_STATUS.md) for current status and exact blockers. The old setup and release instructions should not be used until those release gates are closed.
