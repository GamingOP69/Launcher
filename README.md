# Samrat Launcher (Minecraft Java 1.8.9)

This repository is under remediation. **It is not currently a verified Minecraft client release.** The Java desktop window and several module controls are previews: they are not connected to a real Minecraft 1.8.9 runtime. Do not rely on the existing client JAR, its UI, or its release listing as evidence that in-game features work.

The source contains a Rust/Tauri launcher, a React/TypeScript UI, and Java preview/client code. A genuine game integration and complete clean-install launch path are release blockers. Launcher code now refuses to substitute the Swing preview when Minecraft runtime preparation fails.

## Current support status

| Area | Status |
|---|---|
| Windows x64 launcher | Built by the Windows GitHub Actions workflow; current source changes still need an Actions run and package inspection. |
| Minecraft 1.8.9 / Forge | A minimal Forge mod entrypoint and HUD smoke marker now exist under `forge-client/`. GitHub Actions build and Xvfb main-menu smoke are pending; the native launcher install/launch pipeline is still disabled and has not started this mod. |
| Microsoft authentication | Must be used for online-mode servers; local profiles are not valid credentials for Hypixel or other online-mode servers. Authentication UX and token storage are still under remediation. |
| Add-on catalog | Disabled until each artifact has a reviewed source, compatibility record, size bound, and trusted digest. |
| Built-in modules | UI configuration is preview-only until connected to the game. |
| Performance | No FPS or superiority claims are substantiated. Collect repeatable before/after measurements before making claims. |

Do not use this launcher to connect an offline/local profile to an online-mode server. It does not bypass Microsoft or Minecraft authentication.

## Repository layout

- `launcher/`: Tauri v2 + Rust launcher and React/TypeScript interface.
- `client/`, `core/`: standalone Java preview and existing logic, not the shipped game mod.
- `forge-client/`: minimal Forge 1.8.9 mod and Actions development smoke; not yet installed or launched by the native launcher.
- `.github/workflows/`: CI-only validation, builds, and commit-specific Actions artifacts.
- `docs/REMEDIATION_STATUS.md`: evidence-based findings, changes, validation, and remaining risk.

## Validation and downloads

Do not build, test, or package this project on the user's PC. Pushes to branches and pull requests are configured to run validation in GitHub Actions. Successful runs expose downloadable artifacts named with the commit SHA. A stable GitHub Release is separate and requires a protected `vMAJOR.MINOR.PATCH` tag plus repository variables `ALLOW_STABLE_RELEASE=true` and `REAL_GAME_SMOKE_VERIFIED=true`. These variables are explicit release gates and must only be set after review and observed runtime evidence. PR workflows have read-only repository permissions and do not publish stable releases.

A green build is not proof of clean installation, Microsoft account behavior, a Minecraft main menu, GPU rendering, or gameplay correctness. Those checks remain release gates and are recorded in the remediation ledger.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Report security issues privately using the repository's supported contact channel.

## License

This project is licensed under the [MIT License](LICENSE). Minecraft is a trademark of Mojang AB/Microsoft; this is an independent project.
