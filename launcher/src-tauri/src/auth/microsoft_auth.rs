#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::time::Duration;

pub const MS_CLIENT_ID: &str = "00000000402b5328"; // Standard public Minecraft OAuth Client ID

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceCodeResponse {
    pub user_code: String,
    pub device_code: String,
    pub verification_uri: String,
    pub expires_in: u64,
    pub interval: u64,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MinecraftProfile {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub skin_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthAccount {
    pub id: String,
    pub username: String,
    pub uuid: String,
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: u64,
    pub is_dev_mode: bool,
    pub avatar_url: String,
}

/// Initiates standard Microsoft OAuth2 Device Code flow.
pub async fn request_device_code() -> Result<DeviceCodeResponse, String> {
    let client = reqwest::Client::new();
    let params = [
        ("client_id", MS_CLIENT_ID),
        ("scope", "XboxLive.signin offline_access"),
    ];

    let resp = client
        .post("https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Network error requesting device code: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("Microsoft Auth Error (Status {})", resp.status()));
    }

    resp.json::<DeviceCodeResponse>()
        .await
        .map_err(|e| format!("Failed to parse device code response: {}", e))
}

/// Fetches Minecraft profile details for an authenticated user.
pub async fn fetch_minecraft_profile(bearer_token: &str) -> Result<MinecraftProfile, String> {
    let client = reqwest::Client::new();
    let resp = client
        .get("https://api.minecraftservices.com/minecraft/profile")
        .bearer_auth(bearer_token)
        .send()
        .await
        .map_err(|e| format!("Failed to contact Minecraft services: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("Failed to retrieve Minecraft profile (Status {})", resp.status()));
    }

    resp.json::<MinecraftProfile>()
        .await
        .map_err(|e| format!("Failed to parse profile payload: {}", e))
}

/// Polls for user authorization completion on the device code.
pub async fn poll_device_code_token(device_code: &str, interval_sec: u64, max_attempts: u32) -> Result<AuthAccount, String> {
    let client = reqwest::Client::new();
    let params = [
        ("client_id", MS_CLIENT_ID),
        ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
        ("device_code", device_code),
    ];

    let poll_interval = Duration::from_secs(interval_sec.max(3));

    for _ in 0..max_attempts {
        tokio::time::sleep(poll_interval).await;

        let resp = client
            .post("https://login.microsoftonline.com/consumers/oauth2/v2.0/token")
            .form(&params)
            .send()
            .await;

        if let Ok(res) = resp {
            if res.status().is_success() {
                #[derive(Deserialize)]
                struct TokenSuccess {
                    access_token: String,
                    refresh_token: Option<String>,
                    expires_in: u64,
                }

                if let Ok(token_data) = res.json::<TokenSuccess>().await {
                    let profile = fetch_minecraft_profile(&token_data.access_token)
                        .await
                        .unwrap_or_else(|_| MinecraftProfile {
                            id: "00000000-0000-0000-0000-000000000000".to_string(),
                            name: "SamratPlayer".to_string(),
                            skin_url: None,
                        });

                    let now = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_secs();

                    return Ok(AuthAccount {
                        id: format!("ms-{}", profile.id),
                        username: profile.name.clone(),
                        uuid: profile.id,
                        access_token: token_data.access_token,
                        refresh_token: token_data.refresh_token,
                        expires_at: now + token_data.expires_in,
                        is_dev_mode: false,
                        avatar_url: profile.skin_url.unwrap_or_else(|| {
                            format!("https://mc-heads.net/avatar/{}/64", profile.name)
                        }),
                    });
                }
            }
        }
    }

    Err("Authentication timed out waiting for user approval.".to_string())
}

/// Creates a strictly local development testing profile.
pub fn create_dev_sandbox_account(username: &str) -> AuthAccount {
    let safe_user = if username.trim().is_empty() {
        "SamratDev"
    } else {
        username.trim()
    };

    AuthAccount {
        id: format!("dev-{}", safe_user.to_lowercase()),
        username: safe_user.to_string(),
        uuid: "00000000-0000-0000-0000-000000000000".to_string(),
        access_token: "dev_local_access_token".to_string(),
        refresh_token: None,
        expires_at: 0,
        is_dev_mode: true,
        avatar_url: format!("https://mc-heads.net/avatar/{}/64", safe_user),
    }
}
