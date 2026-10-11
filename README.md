# Samrat Launcher (Minecraft Java 1.8.9)

This repository is under remediation. **It is not currently a verified Minecraft client release.** The Java desktop window and several module controls are previews: they are not connected to a real Minecraft 1.8.9 runtime. Do not rely on the existing client JAR, its UI, or its release listing as evidence that in-game features work.

The source contains a Rust/Tauri launcher, a React/TypeScript UI, Java Swing preview code, and a separate Forge 1.8.9 mod. The native launcher has a Mojang metadata-based vanilla installer and an offline local-profile launch path. The Windows package smoke has verified that the installed launcher invokes Mojang's Minecraft 1.8.9 main class under Java 8, but the hosted Windows VM exits before opening a game window because it has no usable OpenGL context. A CI-only Mesa software-renderer retry is running; it is not part of the product package. The launcher does not currently ship the Forge mod or Samrat PvP features.

## Current support status

| Area | Status |
|---|---|
| Windows x64 launcher | The clean-runner package in [Actions run 38145223472](https://github.com/GamingOP69/Launcher/actions/runs/38145223472) installed and launched the actual 1.8.9 main class, then failed at OpenGL context creation. The software-renderer retry is running in [Actions run 38146630211](https://github.com/GamingOP69/Launcher/actions/runs/38146630211). No Minecraft window has passed yet. |
| Minecraft 1.8.9 / Forge | Actions run [38138523392](https://github.com/GamingOP69/Launcher/actions/runs/38138523392) built a minimal Forge mod and reached the real 1.8.9 main menu under software OpenGL. This is a development smoke; the Forge mod and HUD marker are not installed or launched by Tauri. |
| Microsoft authentication | Must be used for online-mode servers; local profiles are not valid credentials for Hypixel or other online-mode servers. The OAuth helper is incomplete and unwired. Account JSON stores metadata only and clears session tokens; there is no OS credential vault yet. |
| Add-on catalog | Disabled until each artifact has a reviewed source, compatibility record, size bound, and trusted digest. |
| Built-in modules | UI configuration is preview-only until connected to the game. |
| Performance | No FPS or superiority claims are substantiated. Collect repeatable before/after measurements before making claims. |

Local profiles launch with an empty token and are intended for single-player or explicitly offline-mode environments. They do not authenticate Microsoft/Minecraft accounts and cannot join online-mode servers such as Hypixel. Microsoft account launch is unavailable until secure credential storage, token refresh, and authenticated session construction are implemented.

## Repository layout

- `launcher/`: Tauri v2 + Rust launcher and React/TypeScript interface.
- `client/`, `core/`: standalone Java preview and existing logic, not the shipped game mod.
- `forge-client/`: minimal Forge 1.8.9 mod and Actions development smoke; not yet installed or launched by the native launcher.
- `.github/workflows/`: CI-only validation, builds, and commit-specific Actions artifacts.
- `docs/REMEDIATION_STATUS.md`: evidence-based findings, changes, validation, and remaining risk.

## Validation and downloads

Do not build, test, or package this project on the user's PC. Pushes to branches and pull requests are configured to run validation in GitHub Actions. Successful runs expose downloadable artifacts named with the commit SHA. A stable GitHub Release is separate and requires a protected `vMAJOR.MINOR.PATCH` tag plus repository variables `ALLOW_STABLE_RELEASE=true` and `REAL_GAME_SMOKE_VERIFIED=true`. These variables are explicit release gates and must only be set after review and observed runtime evidence. PR workflows have read-only repository permissions and do not publish stable releases.

The current package smoke installs Java 8 and the Mojang runtime, invokes the installed launcher engine, checks the Mojang main-class process, game window, and bounded process survival, then uninstalls. Run [38145223472](https://github.com/GamingOP69/Launcher/actions/runs/38145223472) verified the Mojang main-class launch but exposed the runner's missing OpenGL context. Run [38146630211](https://github.com/GamingOP69/Launcher/actions/runs/38146630211) retries with CI-only Mesa llvmpipe. Even a passing software-rendered window check would not establish gameplay features, Microsoft account support, physical GPU rendering, or performance.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Report security issues privately using the repository's supported contact channel.

## License

This project is licensed under the [MIT License](LICENSE). Minecraft is a trademark of Mojang AB/Microsoft; this is an independent project.
