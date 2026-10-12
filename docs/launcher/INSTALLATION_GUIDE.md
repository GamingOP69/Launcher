# Installation & Validation Status

The launcher uses Mojang metadata to install Minecraft 1.8.9 and prepares a pinned Forge 1.8.9 runtime plus a bundled Samrat Forge mod. Clean Windows package smoke [38214127411](https://github.com/GamingOP69/Launcher/actions/runs/38214127411) passed installation, actual Forge-backed game window and main-menu/mod initialization, bounded survival, termination, and uninstall under CI-only Mesa llvmpipe. Mesa is not included in the product and the CI result does not prove physical GPU or gameplay compatibility. The `client/` JAR remains a Swing preview and is excluded from stable release assets.

Local profiles are stored as identity metadata and launch without an access token; they are for single-player or explicitly offline-mode use and cannot join online-mode servers such as Hypixel. Microsoft account launch is unavailable because secure OS credential storage, token refresh, and complete Microsoft/Xbox/Minecraft session validation are not implemented.

Update checks are disabled until the project publishes signed manifests that the launcher can verify using a trusted embedded public key. The launcher does not claim that an update is available or current based on unsigned metadata.

Launcher settings (Java path, memory allocation, window resolution, and launcher-scoped JVM properties) are stored in `.samrat/launcher-settings.json`. Only `-Dsamrat.*` custom properties are accepted; heap, classpath, native path, and Java agent options remain controlled by the launcher. Module and profile presets are preview-only and are not applied to the Forge mod. The current mod has a basic marker, not the planned PvP QoL feature suite.

## Current development workflow

1. Use GitHub Actions to build and test. Do not run build, test, or packaging commands on the user's PC.
2. Push a branch or open a pull request. Workflows are configured to validate all branch pushes and pull requests and upload commit-specific artifacts.
3. Inspect the exact run and download artifacts from that run. An Actions artifact is a build output, not a stable release.
4. Stable releases are gated on protected `v*` version tags. Repository tag protection must be configured and verified before relying on this gate.

The Windows package workflow builds the Forge mod with Java 8, bundles it into the Tauri package, installs verified Mojang and Forge libraries, launches through LaunchWrapper/FMLTweaker, and checks for the Forge client initialization and Minecraft main-menu markers. This path passed on `9e3dbba` in [38214127411](https://github.com/GamingOP69/Launcher/actions/runs/38214127411). Earlier invalid checksum URL and digest failures are recorded as resolved in the remediation ledger.

## Release verification still required

Before distributing a client, provide evidence for a clean Windows x64 installation, trusted Minecraft/Forge dependency downloads, a launcher-driven packaged Forge 1.8.9 main-menu startup, and in-game feature smoke checks. Stable releases run the packaged smoke before publication, but repository tag protection and release variables must be verified by a maintainer. Microsoft authentication remains unavailable; local profiles cannot join online-mode servers. GPU rendering and gameplay checks require a real machine and are not established by compilation alone.

See [the remediation ledger](../REMEDIATION_STATUS.md) for current status and exact blockers. The old setup and release instructions should not be used until those release gates are closed.
