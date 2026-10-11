# Security Policy

## Supported releases

No release from the current remediation work is verified as a working Minecraft client. Existing published releases predate these changes and are not certified by this policy. Do not use their Swing preview JAR as a game client.

## Reporting a vulnerability

The historical address `security@samratclient.internal` is not a verified public reporting channel. Do not send reports there. Use GitHub's private vulnerability reporting/advisory feature for this repository if it is enabled. If it is unavailable, contact a repository maintainer privately through GitHub and do not include exploit details in a public issue.

## Current security limitations

- The add-on catalog, client install, and game launch commands are disabled until a real integration and verified artifacts exist.
- Local profiles use an offline UUID and no access token; they do not authenticate online-mode servers.
- Account metadata is stored in `accounts.json`. Save and load clear access/refresh tokens and expiry; no OS credential vault or Microsoft session flow is integrated.
- The update checker does not verify a signed manifest or install updates. A local SHA-256 helper does not prove publisher authenticity.
- Update-file checks canonicalize the existing target and data root to reject symlink escapes, but retain a time-of-check/time-of-use race and have no Windows reparse-point validation. Download/install and archive safety remain incomplete; no claim of complete path or archive safety is made.

## Project policy

Future game-side features must remain client-side and fair-play. Do not implement authentication bypasses, server-side effects, aim assistance, combat automation, or anti-cheat evasion. Verify each proposed feature against current server rules and document only measured behavior.
