# Launcher Architecture

## Technology stack

- Native launcher: Tauri v2 and Rust.
- Interface: React 18 and TypeScript.
- Java source: `client/` is a Swing preview; `forge-client/` is a separate Forge 1.8.9 mod targeting Java 8. Actions run [38138523392](https://github.com/GamingOP69/Launcher/actions/runs/38138523392) validated Forge initialization and the Minecraft main menu under software OpenGL, but the mod is not installed or launched by Tauri.

## Current boundaries and limitations

- The launcher exposes Tauri commands to the local React UI. A restrictive CSP is configured, and the unused shell plugin/capability has been removed.
- `download_client` invokes the Mojang metadata-based installer. `launch_game` loads the active account and accepts only a local profile, then launches vanilla 1.8.9 with an empty token. Package run [38147574400](https://github.com/GamingOP69/Launcher/actions/runs/38147574400) installed the artifact, launched the actual game using Java 8 and CI-only Mesa software OpenGL, and observed the `Minecraft 1.8.9` window. The workflow failed after that because its 35-second wait was shorter than the launcher’s 90-second bounded process-survival window; the corrected harness now awaits Actions.
- The Swing preview is not added to the Minecraft classpath. The separate Forge development module is not installed or launched by Tauri yet.
- Microsoft OAuth helper code is incomplete and not wired into the UI. Local profiles are offline identity metadata only and must not be used for online-mode authentication.
- Account metadata is stored in `accounts.json`; access/refresh tokens are cleared on persistence and load until an OS credential vault is implemented. A stored Microsoft account therefore cannot currently authenticate a game session.
- The update manifest has no verified signing-key pipeline. Local SHA-256 checking alone does not prove publisher trust.

## Rust source map

```
launcher/src-tauri/src/
├── main.rs            # Tauri bootstrap and command registration
├── commands.rs        # UI commands; vanilla install and local-profile launch, Microsoft launch rejected
├── auth/              # Local profiles and incomplete, unwired Microsoft OAuth helper
├── java/              # Java runtime discovery
├── launch/            # Mojang metadata installer, argument construction, and process lifecycle
├── updater/           # Manifest lookup, version comparison, local SHA-256 helper
└── security/          # Path utilities and log sanitization
```

See [the remediation ledger](../REMEDIATION_STATUS.md) for validation state and remaining risks. Do not infer runtime support from a source module name or a successful compile.
