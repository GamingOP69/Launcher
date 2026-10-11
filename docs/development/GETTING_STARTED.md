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

Every branch push and pull request is configured to run checks in Actions and upload commit-specific artifacts. The Forge development smoke reaches the Minecraft main menu under software OpenGL. Windows package run [38147574400](https://github.com/GamingOP69/Launcher/actions/runs/38147574400) installed the package, launched the real 1.8.9 game, and observed its window; it failed afterward because the harness wait was shorter than the configured survival window. A corrected harness is awaiting Actions. See [the remediation ledger](../REMEDIATION_STATUS.md) for current evidence and remaining work.
