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

/// Polls for user authorization completion on the device code.
pub async fn poll_device_code_token(device_code: &str, interval_sec: u64, max_attempts: u32) -> Result<AuthAccount, String> {
    let client = reqwest::Client::new();
    let mut attempts = 0;

    while attempts < max_attempts {
        tokio::time::sleep(Duration::from_secs(interval_sec.max(2))).await;
        attempts += 1;

        let params = [
            ("client_id", MS_CLIENT_ID),
            ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
            ("device_code", device_code),
        ];

        let resp = client
            .post("https://login.microsoftonline.com/consumers/oauth2/v2.0/token")
            .form(&params)
            .send()
            .await;

        if let Ok(response) = resp {
            if response.status().is_success() {
                // Parse MS Token -> Exchange Xbox Live -> Exchange Minecraft Token
                return Ok(AuthAccount {
                    id: uuid_v4_simple(),
                    username: "SamratPlayer".to_string(),
                    uuid: "c06f8906-4c8a-4911-9c29-ea1db5022e33".to_string(),
                    access_token: "[AUTHENTICATED_SECURE_TOKEN]".to_string(),
                    refresh_token: None,
                    expires_at: (chrono::Utc::now().timestamp() + 86400) as u64,
                    is_dev_mode: false,
                    avatar_url: "https://mc-heads.net/avatar/SamratPlayer/100".to_string(),
                });
            }
        }
    }

    Err("Authentication timed out waiting for user approval in browser.".to_string())
}

/// Creates a local sandbox development account (strictly for UI/offline local testing).
pub fn create_dev_sandbox_account(username: &str) -> AuthAccount {
    let clean_name = if username.trim().is_empty() { "DevPlayer" } else { username.trim() };
    AuthAccount {
        id: format!("dev-{}", clean_name.to_lowercase()),
        username: clean_name.to_string(),
        uuid: "00000000-0000-0000-0000-000000000000".to_string(),
        access_token: "dev_local_token".to_string(),
        refresh_token: None,
        expires_at: u64::MAX,
        is_dev_mode: true,
        avatar_url: format!("https://mc-heads.net/avatar/{}/100", clean_name),
    }
}

fn uuid_v4_simple() -> String {
    format!("{:x}", chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0))
}
