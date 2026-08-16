# Samrat Client Authentication Model

## Security Principles

1. **Direct Microsoft OAuth2 Device Flow**:
   - The user opens `https://microsoft.com/link` in their browser and enters the code presented by the launcher.
   - Credentials (passwords, emails, 2FA prompts) are entered strictly into official Microsoft login pages.
   - The launcher receives an authorization token and exchanges it with Xbox Live (`user.auth.xboxlive.com`) and Minecraft Services (`api.minecraftservices.com`).

2. **Development Sandbox Profile**:
   - Strictly for local UI, HUD, and layout testing without requiring an active internet connection.
   - Clearly marked with a `DEV SANDBOX` badge in both the launcher and client.
   - Does not attempt to authenticate against online Mojang servers or bypass server authentication.

3. **Log Sanitization**:
   - All OAuth access tokens, bearer tokens, passwords, and private user home directories are scrubbed before being written to disk or shown in crash logs.
