# Installation & Validation Status

**The launcher is not currently a verified Minecraft Java 1.8.9 client.** Existing published release assets predate the remediation work. A separate Forge 1.8.9 development mod now exists in `forge-client/`, but its Actions main-menu smoke is pending and the native Tauri launcher does not yet install or start it. The Java artifact in `client/` remains a Swing preview. Do not treat the current JAR or installer as a working gameplay client.

## Current development workflow

1. Use GitHub Actions to build and test. Do not run build, test, or packaging commands on the user's PC.
2. Push a branch or open a pull request. Workflows are configured to validate all branch pushes and pull requests and upload commit-specific artifacts.
3. Inspect the exact run and download artifacts from that run. An Actions artifact is a build output, not a stable release.
4. Stable releases are gated on protected `v*` version tags. Repository tag protection must be configured and verified before relying on this gate.

## Release verification still required

Before distributing a client, the remediation must provide evidence for a clean Windows x64 installation, trusted Minecraft/Forge dependency downloads, Microsoft authentication for online-mode play, a launcher-driven Minecraft 1.8.9 main-menu startup, and in-game feature smoke checks. The CI Forge development smoke can validate Forge/game startup under a virtual display, but it does not validate the packaged Tauri launcher. GPU rendering and gameplay checks require a real machine and are not established by compilation alone. Offline local profiles must not be represented as valid for online-mode servers.

See [the remediation ledger](../REMEDIATION_STATUS.md) for current status and exact blockers. The old setup and release instructions should not be used until those release gates are closed.
