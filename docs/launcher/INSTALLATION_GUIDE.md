# Samrat Launcher — Installation & Windows Setup Guide

## Requirements

- **Operating System**: Windows 10 or Windows 11 (64-bit).
- **Architecture**: x86_64.
- **Java**: 64-bit Java 8 or Java 17 (The launcher detects installed runtimes automatically).

## Installation Options

### 1. Windows Installer (Recommended)
1. Download `SamratLauncher-Setup-x64.msi` or `.exe` from the official [GitHub Releases](https://github.com/samrat-client/launcher/releases).
2. Run the installer and follow the on-screen setup prompts.
3. Launch **Samrat Launcher** from your Start Menu or Desktop shortcut.

### 2. Portable Executable
1. Download `samrat-launcher.exe`.
2. Place it in any user-accessible directory (e.g. `C:\SamratLauncher\`).
3. Run the executable directly.

## Verifying Download Integrity

Check the downloaded file against the published `SHA256SUMS.txt`:
```powershell
Get-FileHash .\SamratLauncher-Setup-x64.msi -Algorithm SHA256
```
Compare the resulting hash with the hash provided in the release notes.
