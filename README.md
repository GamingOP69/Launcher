# Samrat Launcher (Minecraft Java 1.8.9)

This repository is under remediation. **It is not currently a verified Minecraft client release.** The packaged Forge launcher path is being validated in GitHub Actions. Do not rely on old release assets, preview UI, or the current minimal HUD marker as evidence that the advertised feature set is complete.

The source contains a Rust/Tauri launcher, a React/TypeScript UI, Java Swing preview code, and a Forge 1.8.9 mod. Earlier Windows package run [38150592212](https://github.com/GamingOP69/Launcher/actions/runs/38150592212) passed clean install, actual vanilla Minecraft 1.8.9 window startup, bounded survival, process termination, and uninstall under CI-only Mesa software rendering. The Forge package path is now wired into the same clean-install main-menu/mod-marker smoke used by branch CI and stable-tag builds, but no successful current-run evidence has been observed yet. The mod currently contains a small HUD marker and CI markers; the advertised module suite is not implemented in-game.

## Current support status

| Area | Status |
|---|---|
| Windows x64 launcher | Vanilla package smoke [38150592212](https://github.com/GamingOP69/Launcher/actions/runs/38150592212) passed under CI-only Mesa software OpenGL. Forge package smoke is configured for clean install, main-menu/mod markers, bounded lifetime, termination, and uninstall; current-run validation is pending. |
| Minecraft 1.8.9 / Forge | Forge development main-menu smoke passed in Client Matrix [38153589815](https://github.com/GamingOP69/Launcher/actions/runs/38153589815). Packaged Forge runtime/mod startup and in-game QoL feature checks remain unverified. |
| Microsoft authentication | Must be used for online-mode servers; local profiles are not valid credentials for Hypixel or other online-mode servers. The OAuth helper is incomplete and unwired. Account JSON stores metadata only and clears session tokens; there is no OS credential vault yet. |
| Add-on catalog | Disabled until each artifact has a reviewed source, compatibility record, size bound, and trusted digest. |
| Built-in modules | Existing module list/configuration is preview-only. The packaged Forge mod currently has only a basic in-game marker. |
| Performance | No FPS or superiority claims are substantiated. Collect repeatable before/after measurements before making claims. |

Local profiles launch with an empty token and are intended for single-player or explicitly offline-mode environments. They do not authenticate Microsoft/Minecraft accounts and cannot join online-mode servers such as Hypixel. Microsoft account launch is unavailable until secure credential storage, token refresh, and authenticated session construction are implemented.

Account metadata is stored without authentication tokens. If account storage is malformed, the launcher reports an error and leaves the file unchanged; writes are not yet atomic.

Update checks are currently unavailable. The launcher will not trust or act on remote update metadata until signed manifests, an embedded verification key, and a reliable package version are in place.

## Repository layout

- `launcher/`: Tauri v2 + Rust launcher and React/TypeScript interface.
- `client/`, `core/`: standalone Java preview and existing logic, not the shipped game mod.
- `forge-client/`: Forge 1.8.9 mod. Package integration is being validated; supported PvP QoL features are not complete.
- `.github/workflows/`: CI-only validation, builds, and commit-specific Actions artifacts.
- `docs/REMEDIATION_STATUS.md`: evidence-based findings, changes, validation, and remaining risk.

## Validation and downloads

Do not build, test, or package this project on the user's PC. Pushes to branches and pull requests are configured to run validation in GitHub Actions. Successful runs expose downloadable artifacts named with the commit SHA. Stable releases are restricted to protected `vMAJOR.MINOR.PATCH` tags and repository variables `ALLOW_STABLE_RELEASE=true` and `REAL_GAME_SMOKE_VERIFIED=true`; the release workflow now performs its own clean-install Forge smoke before publishing. Tag protection and variable configuration still require maintainer verification. PR workflows have read-only repository permissions and do not publish stable releases. Stable release assets are the Tauri MSI, NSIS installer, SHA-256 checksum file, and machine-readable release manifest; the Swing preview JAR is excluded.

The prior package smoke installed Java 8 and Mojang files, started vanilla Minecraft, checked its window and bounded process lifetime, and uninstalled. The current Forge package smoke checks LaunchWrapper/FMLTweaker, mod initialization and main-menu markers. A successful current Forge package smoke is not yet evidenced. Software rendering does not establish gameplay features, Microsoft account support, physical GPU rendering, or performance.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Report security issues privately using the repository's supported contact channel.

## License

This project is licensed under the [MIT License](LICENSE). Minecraft is a trademark of Mojang AB/Microsoft; this is an independent project.
