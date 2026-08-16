# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| 0.9.x   | :white_check_mark: |
| < 0.9   | :x:                |

## Reporting a Vulnerability

We take the security of the **SAMRAT CLIENT** ecosystem seriously. If you believe you have discovered a security vulnerability in either the Launcher or the Minecraft Client, please do NOT file a public issue.

### Reporting Process
1. Email a detailed vulnerability description to `security@samratclient.internal` or open a private security advisory on GitHub.
2. Include:
   - Component affected (Launcher / Rust Core / Client / Auth Flow / Config Engine)
   - Step-by-step reproduction steps or Proof-of-Concept
   - Potential impact
   - Proposed remediation if available

### Security Principles in Samrat Client
- **Legitimate Authentication**: We only use standard Microsoft OAuth2 / Xbox Live authentication. User credentials, access tokens, and refresh tokens are strictly kept in secure OS storage and never logged, emitted, or shared.
- **Path Traversal Guards**: The launcher strictly sanitizes all file paths and prevents arbitrary file writes or execution outside authorized directories.
- **Update Verification**: All auto-update packages and client artifacts require SHA-256 integrity verification against signed manifests before execution.
- **No Cheat/Exploit Code**: The project contains zero cheats, anti-cheat bypasses, or network exploit code.
