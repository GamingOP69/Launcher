# Getting Started with Samrat Launcher Development

## The Zero-Local-Toolchain Workflow

This repository owner requires builds, tests, and packaging to run in GitHub Actions, not on their PC. Do not run those commands locally for this remediation. The Forge 1.8.9 module uses a separate legacy toolchain (JDK 8 and Gradle 2.14.1) from the launcher and Swing preview builds.

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/GamingOP69/Launcher.git
   cd launcher
   ```
2. **Make Edits**:
   - Forge mod code: `forge-client/src/main/java/`
   - Swing preview code: `client/src/main/java/`
   - Launcher UI: `launcher/src/`
   - Launcher Rust Core: `launcher/src-tauri/src/`
3. **Push to GitHub**:
   - Push your branch to GitHub.
   - GitHub Actions will automatically execute all compilation, testing, static analysis, and packaging tasks.

Every branch push and pull request is configured to run checks in Actions and upload commit-specific artifacts. The Forge workflow builds with JDK 8 and launches a development Minecraft client under Xvfb; it is not evidence that the Tauri package can install or start the game. See [the remediation ledger](../REMEDIATION_STATUS.md) for the current run links and remaining work.
