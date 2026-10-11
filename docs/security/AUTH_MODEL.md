# Authentication and profile behavior

## Current implementation

The launcher currently exposes local profile creation and switching only. A local profile uses a Minecraft offline UUID and no access token; it is suitable only for single-player or servers explicitly configured for offline-mode. It does not authenticate a Microsoft/Minecraft account and is not valid for Hypixel or any server requiring online-mode authentication.

Microsoft OAuth helper code exists, but it is not connected to a launcher command or UI. It does not complete the Xbox Live, XSTS, Minecraft Services login, and entitlement exchange needed for a valid Minecraft game session. Profile retrieval now fails closed instead of manufacturing a local fallback profile. Do not use this helper as an online authentication flow.

Account metadata is serialized to `accounts.json`. The save path clears access/refresh tokens and expiry, and loading old account files clears them too. This intentionally means a Microsoft account cannot persist a usable session; online launch remains unavailable until an OS credential vault and full token lifecycle are implemented.

If the account file is unreadable, malformed, larger than 1 MiB, or contains more than 128 profiles, account operations return an error and leave the file in place instead of silently replacing it with empty storage. Writes are staged and replaced through the shared same-directory helper; Windows replacement behavior remains pending CI validation.

## Required design before online accounts are enabled

- Use Microsoft’s official browser/device authorization flow; never collect Microsoft passwords in the launcher.
- Complete Xbox Live, XSTS, Minecraft Services, and entitlement checks; pass a valid Minecraft session token to the game.
- Store refresh/session credentials in the platform credential vault, with expiry and revoke/remove handling.
- Keep local offline profiles visibly separate from authenticated accounts and explain server limitations.
- Redact credentials from logs and diagnostics; test every authentication failure path.
