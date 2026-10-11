# Launcher Architecture

## Technology stack

- Native launcher: Tauri v2 and Rust.
- Interface: React 18 and TypeScript.
- Java source: standalone preview and client logic targeting Java 8 bytecode; not yet a Forge mod.

## Current boundaries and limitations

- The launcher exposes Tauri commands to the local React UI. A restrictive CSP is configured, and the unused shell plugin/capability has been removed.
- Process and installer code exists, but the current `launch_game` command and client installation command fail closed. The app does not currently start Minecraft or the Swing preview.
- Java process logging and a partial Minecraft installer remain in source but have not been validated for a clean install or real game startup.
- Microsoft OAuth helper code is incomplete and not wired into the UI; local profiles use placeholder credentials and are only for offline-mode play.
- Account data is stored in `accounts.json` without an OS credential vault. Do not store real session credentials in the current implementation.
- The update manifest has no verified signing-key pipeline. Local SHA-256 checking alone does not prove publisher trust.

## Rust source map

```
launcher/src-tauri/src/
├── main.rs            # Tauri bootstrap and command registration
├── commands.rs        # UI commands; install/launch/add-on actions currently fail closed
├── auth/              # Local profiles and incomplete, unwired Microsoft OAuth helper
├── java/              # Java runtime discovery
├── launch/            # Legacy launch argument, process, and partial installer code
├── updater/           # Manifest lookup, version comparison, local SHA-256 helper
└── security/          # Path utilities and log sanitization
```

See [the remediation ledger](../REMEDIATION_STATUS.md) for validation state and remaining risks. Do not infer runtime support from a source module name or a successful compile.
