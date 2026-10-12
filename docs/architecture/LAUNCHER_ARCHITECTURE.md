# Launcher Architecture

## Technology stack

- Native launcher: Tauri v2 and Rust.
- Interface: React 18 and TypeScript.
- Java source: `client/` is a Swing preview; `forge-client/` is a separate Forge 1.8.9 mod targeting Java 8. The Tauri launch path downloads and validates the pinned Forge profile/libraries, installs the bundled mod, and starts LaunchWrapper with `FMLTweaker`. Clean package run [38214127411](https://github.com/GamingOP69/Launcher/actions/runs/38214127411) reached the Minecraft main menu and logged mod initialization. Gameplay/QoL and physical GPU checks remain outstanding.

## Current boundaries and limitations

- The launcher exposes Tauri commands to the local React UI. A restrictive CSP is configured, and the unused shell plugin/capability has been removed.
- `download_client` invokes the Mojang/Forge metadata-based installer. `launch_game` loads the active account and accepts only a local profile, then launches the pinned Forge 1.8.9 runtime with an empty token. Clean packaged Forge launch is validated in [38214127411](https://github.com/GamingOP69/Launcher/actions/runs/38214127411). Physical GPU and gameplay behavior remain unverified.
- The Swing preview is not added to the Minecraft classpath. The Forge module is bundled as a Tauri resource by CI and copied into the game mods directory at launch. Its current runtime contribution is a minimal marker; the broader PvP QoL feature suite is not implemented.
- Microsoft OAuth helper code is incomplete and not wired into the UI. Local profiles are offline identity metadata only and must not be used for online-mode authentication.
- Account metadata is stored in `accounts.json`; access/refresh tokens are cleared on persistence and load until an OS credential vault is implemented. A stored Microsoft account therefore cannot currently authenticate a game session.
- Launch settings are stored separately in `.samrat/launcher-settings.json` with schema versioning, bounds, staged writes, and debounced frontend persistence. Custom JVM properties are restricted to the `-Dsamrat.*` namespace. Profile presets and module flags are not runtime-applied.
- The update manifest has no verified signing-key pipeline. Local SHA-256 checking alone does not prove publisher trust.

## Rust source map

```
launcher/src-tauri/src/
├── main.rs            # Tauri bootstrap and command registration
├── commands.rs        # UI commands; Forge install and local-profile launch, Microsoft launch rejected
├── auth/              # Local profiles and incomplete, unwired Microsoft OAuth helper
├── java/              # Java runtime discovery
├── launch/            # Mojang metadata installer, argument construction, and process lifecycle
├── updater/           # Manifest lookup, version comparison, local SHA-256 helper
└── security/          # Path utilities and log sanitization
```

See [the remediation ledger](../REMEDIATION_STATUS.md) for validation state and remaining risks. Do not infer runtime support from a source module name or a successful compile.
