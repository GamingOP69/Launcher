# Authentication and profile behavior

## Current implementation

The launcher currently exposes local profile creation and switching only. A local profile uses a locally generated UUID and placeholder token; it is suitable only for offline-mode servers. It does not authenticate a Microsoft/Minecraft account and is not valid for Hypixel or any server requiring online-mode authentication.

Microsoft OAuth helper code exists, but it is not connected to a launcher command or UI. It does not complete the Xbox Live, XSTS, Minecraft Services login, and entitlement exchange needed for a valid Minecraft game session. Profile retrieval now fails closed instead of manufacturing a local fallback profile. Do not use this helper as an online authentication flow.

Account data is currently serialized to `accounts.json`; tokens are not stored in an OS credential vault. Avoid adding real online credentials until secure storage and token lifecycle handling are implemented.

## Required design before online accounts are enabled

- Use Microsoft’s official browser/device authorization flow; never collect Microsoft passwords in the launcher.
- Complete Xbox Live, XSTS, Minecraft Services, and entitlement checks; pass a valid Minecraft session token to the game.
- Store refresh/session credentials in the platform credential vault, with expiry and revoke/remove handling.
- Keep local offline profiles visibly separate from authenticated accounts and explain server limitations.
- Redact credentials from logs and diagnostics; test every authentication failure path.
