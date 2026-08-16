# Samrat Launcher Architecture

## Technology Stack

- **Framework**: Tauri v2 (Rust Backend + React 18 / TypeScript Frontend)
- **Styling**: Modern, futuristic dark theme with neon cyan glowing accents and responsive UI controls.
- **Process Management**: Asynchronous Java process spawning with piped standard output/error monitoring.
- **Security**: Standard Microsoft OAuth2 device code flow with token storage encryption and automatic credential redaction.

## Rust Core Architecture

```
launcher/src-tauri/src/
├── main.rs            # Application bootstrap & handler registry
├── commands.rs        # Tauri IPC commands invoked by React frontend
├── auth/
│   ├── microsoft_auth.rs   # Official Microsoft OAuth2 & Xbox Live authentication flow
│   └── account_manager.rs  # Local account profile persistence
├── java/
│   └── detector.rs         # Scans Windows Registry, PATH, and JAVA_HOME for 64-bit runtimes
├── launch/
│   ├── args_builder.rs     # Generates memory limits, G1GC tuning, resolution, and classpath
│   └── launcher_engine.rs  # Manages process spawning, stdout/stderr pipes, and exit code watchers
├── updater/
│   └── updater_service.rs  # Downloads manifests, compares semver, and verifies SHA-256 integrity
└── security/
    ├── path_guard.rs       # Guards against path traversal and validates file boundaries
    └── sanitizer.rs        # Redacts tokens, passwords, and user paths from all logs
```

## Security & Privacy Highlights

- **No Passwords Collected**: The launcher never asks for or stores user passwords. Authentication is handled exclusively through official Microsoft browser verification URLs.
- **SHA-256 Package Verification**: Auto-updater binaries and client jars are verified against cryptographic SHA-256 hashes before execution.
- **Path Traversal Guards**: Filenames and paths are sanitized to prevent directory escapes.
