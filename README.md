# Samrat Launcher (Minecraft Java 1.8.9)

This repository is under remediation. **It is not currently a verified Minecraft client release.** The packaged Forge launcher path is being validated in GitHub Actions. Do not rely on old release assets, preview UI, or the current minimal HUD marker as evidence that the advertised feature set is complete.

The source contains a Rust/Tauri launcher, a React/TypeScript UI, Java Swing preview code, and a Forge 1.8.9 mod. Earlier Windows package run [38150592212](https://github.com/GamingOP69/Launcher/actions/runs/38150592212) passed clean install, actual vanilla Minecraft 1.8.9 window startup, bounded survival, process termination, and uninstall under CI-only Mesa software rendering. The new Forge runtime and mod bundle are not yet validated by a successful clean-package smoke. The mod currently contains a small HUD marker and CI markers; the advertised module suite is not implemented in-game.

## Current support status

| Area | Status |
|---|---|
| Windows x64 launcher | Vanilla package smoke [38150592212](https://github.com/GamingOP69/Launcher/actions/runs/38150592212) passed under CI-only Mesa software OpenGL. Packaged Forge smoke is pending after earlier failures in the Forge artifact resolver. |
| Minecraft 1.8.9 / Forge | Forge development main-menu smoke passed in Client Matrix [38153589815](https://github.com/GamingOP69/Launcher/actions/runs/38153589815). Packaged Forge runtime/mod startup and in-game QoL feature checks remain unverified. |
| Microsoft authentication | Must be used for online-mode servers; local profiles are not valid credentials for Hypixel or other online-mode servers. The OAuth helper is incomplete and unwired. Account JSON stores metadata only and clears session tokens; there is no OS credential vault yet. |
| Add-on catalog | Disabled until each artifact has a reviewed source, compatibility record, size bound, and trusted digest. |
| Built-in modules | Existing module list/configuration is preview-only. The packaged Forge mod currently has only a basic in-game marker. |
| Performance | No FPS or superiority claims are substantiated. Collect repeatable before/after measurements before making claims. |

Local profiles launch with an empty token and are intended for single-player or explicitly offline-mode environments. They do not authenticate Microsoft/Minecraft accounts and cannot join online-mode servers such as Hypixel. Microsoft account launch is unavailable until secure credential storage, token refresh, and authenticated session construction are implemented.

## Repository layout

- `launcher/`: Tauri v2 + Rust launcher and React/TypeScript interface.
- `client/`, `core/`: standalone Java preview and existing logic, not the shipped game mod.
- `forge-client/`: Forge 1.8.9 mod. Package integration is being validated; supported PvP QoL features are not complete.
- `.github/workflows/`: CI-only validation, builds, and commit-specific Actions artifacts.
- `docs/REMEDIATION_STATUS.md`: evidence-based findings, changes, validation, and remaining risk.

## Validation and downloads

Do not build, test, or package this project on the user's PC. Pushes to branches and pull requests are configured to run validation in GitHub Actions. Successful runs expose downloadable artifacts named with the commit SHA. A stable GitHub Release is separate and requires a protected `vMAJOR.MINOR.PATCH` tag plus repository variables `ALLOW_STABLE_RELEASE=true` and `REAL_GAME_SMOKE_VERIFIED=true`. These variables are explicit release gates and must only be set after review and observed runtime evidence. PR workflows have read-only repository permissions and do not publish stable releases.

The prior package smoke installed Java 8 and Mojang files, started vanilla Minecraft, checked its window and bounded process lifetime, and uninstalled. The Forge package workflow now builds the mod and expects LaunchWrapper/FML markers, but a successful packaged Forge smoke is not yet evidenced. Software rendering does not establish gameplay features, Microsoft account support, physical GPU rendering, or performance.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Report security issues privately using the repository's supported contact channel.

## License

This project is licensed under the [MIT License](LICENSE). Minecraft is a trademark of Mojang AB/Microsoft; this is an independent project.
