# Samrat Launcher (Minecraft Java 1.8.9)

This repository is under remediation. The packaged Forge launch path is verified on a clean Windows CI runner, but **this is not a complete PvP client release**. The current Forge mod provides a small informational HUD; gameplay/QoL checks and physical GPU compatibility remain unverified. Do not treat old release assets or preview controls as evidence that the advertised feature set is complete.

The source contains a Rust/Tauri launcher, React/TypeScript UI, Java Swing preview code, and a Forge 1.8.9 mod. Windows package run [38215734080](https://github.com/GamingOP69/Launcher/actions/runs/38215734080) passed clean install, actual Forge-backed `Minecraft 1.8.9` main-menu/mod initialization, bounded survival, launcher-driven termination, and uninstall using CI-only Mesa software rendering. The in-game HUD displays FPS, coordinates, facing, movement-key state, and sprint state with a Right Shift toggle; this HUD passed formatter tests and package startup in CI but its in-world rendering/input behavior still needs a real gameplay check. Most other module/profile controls are previews.

## Current support status

| Area | Status |
|---|---|
| Windows x64 launcher | Clean package install and smoke passed in [38215734080](https://github.com/GamingOP69/Launcher/actions/runs/38215734080) using CI-only Mesa software OpenGL. Physical GPU compatibility remains unverified. |
| Minecraft 1.8.9 / Forge | Client Matrix and packaged Forge main-menu/mod initialization passed in [38215734198](https://github.com/GamingOP69/Launcher/actions/runs/38215734198) and [38215734080](https://github.com/GamingOP69/Launcher/actions/runs/38215734080). In-world HUD interaction and gameplay checks remain unverified. |
| Microsoft authentication | Must be used for online-mode servers; local profiles are not valid credentials for Hypixel or other online-mode servers. The OAuth helper is incomplete and unwired. Account JSON stores metadata only and clears session tokens; there is no OS credential vault yet. |
| Add-on catalog | Disabled until each artifact has a reviewed source, compatibility record, size bound, and trusted digest. |
| Built-in modules | Existing module list/configuration is preview-only. The packaged Forge mod currently has only a basic in-game marker. |
| Performance | No FPS or superiority claims are substantiated. Collect repeatable before/after measurements before making claims. |

Local profiles launch with an empty token and are intended for single-player or explicitly offline-mode environments. They do not authenticate Microsoft/Minecraft accounts and cannot join online-mode servers such as Hypixel. Microsoft account launch is unavailable until secure credential storage, token refresh, and authenticated session construction are implemented.

Account metadata is stored without authentication tokens. If account storage is malformed, the launcher reports an error and leaves the file unchanged. Account writes use a staged same-directory replacement; Rust regression tests and Windows package build passed in Actions.

Update checks are currently unavailable. The launcher will not trust or act on remote update metadata until signed manifests, an embedded verification key, and a reliable package version are in place.

## Repository layout

- `launcher/`: Tauri v2 + Rust launcher and React/TypeScript interface.
- `client/`, `core/`: standalone Java preview and existing logic, not the shipped game mod.
- `forge-client/`: Forge 1.8.9 mod integrated into the package; supported PvP QoL features are not complete.
- `.github/workflows/`: CI-only validation, builds, and commit-specific Actions artifacts.
- `docs/REMEDIATION_STATUS.md`: evidence-based findings, changes, validation, and remaining risk.

## Validation and downloads

Do not build, test, or package this project on the user's PC. Pushes to branches and pull requests are configured to run validation in GitHub Actions. Successful runs expose downloadable artifacts named with the commit SHA. Stable releases are restricted to protected `vMAJOR.MINOR.PATCH` tags and repository variables `ALLOW_STABLE_RELEASE=true` and `REAL_GAME_SMOKE_VERIFIED=true`; the release workflow now performs its own clean-install Forge smoke before publishing. Tag protection and variable configuration still require maintainer verification. PR workflows have read-only repository permissions and do not publish stable releases. Stable release assets are the Tauri MSI, NSIS installer, SHA-256 checksum file, and machine-readable release manifest; the Swing preview JAR is excluded.

The current package smoke installs Java 8 and verified Mojang/Forge files, starts Minecraft through LaunchWrapper/FMLTweaker, checks Forge initialization and main-menu markers, observes bounded process lifetime, terminates the child, and uninstalls. It does not establish gameplay features, Microsoft account support, physical GPU rendering, settings persistence through restart, or performance gains. See [the remediation ledger](docs/REMEDIATION_STATUS.md) for evidence and remaining risks.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Report security issues privately using the repository's supported contact channel.

## License

This project is licensed under the [MIT License](LICENSE). Minecraft is a trademark of Mojang AB/Microsoft; this is an independent project.
