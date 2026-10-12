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

Every branch push and pull request is configured to run checks in Actions and upload commit-specific artifacts. Windows package run [38215734080](https://github.com/GamingOP69/Launcher/actions/runs/38215734080) passed clean installation, actual Forge-backed Minecraft 1.8.9 main-menu/mod initialization, bounded survival, child termination, and uninstall on CI software OpenGL. The HUD formatter tests passed in Client Matrix [38215734198](https://github.com/GamingOP69/Launcher/actions/runs/38215734198). These results do not prove hardware rendering, in-world HUD interaction/gameplay, or Microsoft authentication. See [the remediation ledger](../REMEDIATION_STATUS.md) for current evidence and remaining work.
