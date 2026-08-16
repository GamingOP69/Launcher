# Contributing to Samrat Client

Thank you for your interest in contributing to the **SAMRAT CLIENT** ecosystem!

## Development Philosophy

1. **Zero Local SDK Setup Requirement**: Local machines do not require full compilation toolchains. All verification and builds are handled via clean GitHub Actions runners.
2. **Strict Legitimacy**: No hacked client features, anti-cheat bypasses, or cracked account logic will ever be accepted.
3. **Performance First**: Avoid allocations in render loops and event ticks. Profile before and after submitting optimizations.
4. **Clean Code**: Follow modular architecture, separate concerns, and provide unit tests for all core components.

## Pull Request Guidelines

1. Fork the repository and create a descriptive branch name (`feat/bedwars-timer`, `fix/hud-snap`).
2. Write clean, documented code and include unit tests in `client/src/test` or `launcher/src-tauri/src`.
3. Verify that CI passes on GitHub Actions (Gradle check, Rust clippy/check, Vite build, CodeQL).
4. Follow conventional commit messages (`feat: ...`, `fix: ...`, `chore: ...`, `test: ...`).
