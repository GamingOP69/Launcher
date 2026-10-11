# Installation & Validation Status

The launcher source contains a Mojang metadata-based vanilla 1.8.9 installer and an offline local-profile launch command. The clean Windows package smoke installed the package and executed Mojang's 1.8.9 main class under Java 8, but the hosted runner had no OpenGL context and no game window appeared ([run 38145223472](https://github.com/GamingOP69/Launcher/actions/runs/38145223472)). A retry adds Mesa llvmpipe only to the CI Java runtime ([run 38146630211](https://github.com/GamingOP69/Launcher/actions/runs/38146630211)); it is not included in the product. The `client/` JAR remains a Swing preview. A separate Forge development smoke reached the Minecraft 1.8.9 main menu under software OpenGL in [Actions run 38138523392](https://github.com/GamingOP69/Launcher/actions/runs/38138523392), but Tauri does not install or launch that Forge mod.

Local profiles are stored as identity metadata and launch without an access token; they are for single-player or explicitly offline-mode use and cannot join online-mode servers such as Hypixel. Microsoft account launch is unavailable because secure OS credential storage, token refresh, and complete Microsoft/Xbox/Minecraft session validation are not implemented.

## Current development workflow

1. Use GitHub Actions to build and test. Do not run build, test, or packaging commands on the user's PC.
2. Push a branch or open a pull request. Workflows are configured to validate all branch pushes and pull requests and upload commit-specific artifacts.
3. Inspect the exact run and download artifacts from that run. An Actions artifact is a build output, not a stable release.
4. Stable releases are gated on protected `v*` version tags. Repository tag protection must be configured and verified before relying on this gate.

The Windows package workflow installs Java 8 and verified Mojang runtime files, launches the vanilla 1.8.9 main class through the installed launcher, and checks the process command line, Minecraft window title, and bounded survival period. The last completed package run confirmed the correct main class but failed at OpenGL context creation; the Mesa-backed retry is pending in [Actions run 38146630211](https://github.com/GamingOP69/Launcher/actions/runs/38146630211).

## Release verification still required

Before distributing a client, the remediation must provide evidence for a clean Windows x64 installation, trusted Minecraft/Forge dependency downloads, Microsoft authentication for online-mode play, a launcher-driven Minecraft 1.8.9 main-menu startup, and in-game feature smoke checks. The CI Forge development smoke can validate Forge/game startup under a virtual display, but it does not validate the packaged Tauri launcher. GPU rendering and gameplay checks require a real machine and are not established by compilation alone. Offline local profiles must not be represented as valid for online-mode servers.

See [the remediation ledger](../REMEDIATION_STATUS.md) for current status and exact blockers. The old setup and release instructions should not be used until those release gates are closed.
