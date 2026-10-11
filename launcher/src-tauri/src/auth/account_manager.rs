use super::microsoft_auth::AuthAccount;
use crate::security::path_guard::get_samrat_data_dir;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AccountStorage {
    pub active_account_id: Option<String>,
    pub accounts: Vec<AuthAccount>,
}

pub struct AccountManager {
    storage_path: PathBuf,
}

impl AccountManager {
    pub fn new() -> Self {
        let dir = get_samrat_data_dir();
        if !dir.exists() {
            let _ = fs::create_dir_all(&dir);
        }
        Self {
            storage_path: dir.join("accounts.json"),
        }
    }

    #[cfg(test)]
    fn with_storage_path(storage_path: PathBuf) -> Self {
        Self { storage_path }
    }

    pub fn load(&self) -> AccountStorage {
        if !self.storage_path.exists() {
            return AccountStorage::default();
        }

        match fs::read_to_string(&self.storage_path) {
            Ok(content) => serde_json::from_str::<AccountStorage>(&content)
                .map(|mut storage| {
                    // Tokens are never restored from launcher JSON. Until an OS-backed
                    // credential store is wired, persisted accounts are metadata only.
                    redact_credentials(&mut storage);
                    storage
                })
                .unwrap_or_default(),
            Err(_) => AccountStorage::default(),
        }
    }

    pub fn save(&self, storage: &AccountStorage) -> Result<(), String> {
        let mut persistable = storage.clone();
        redact_credentials(&mut persistable);
        let json = serde_json::to_string_pretty(&persistable).map_err(|e| e.to_string())?;
        fs::write(&self.storage_path, json).map_err(|e| e.to_string())
    }

    pub fn create_offline_account(username: &str, skin_type: &str) -> AuthAccount {
        let clean_user = if username.trim().is_empty() { "SamratPlayer" } else { username.trim() };
        let mut hash = md5_hash(format!("OfflinePlayer:{}", clean_user).as_bytes());
        hash[6] = (hash[6] & 0x0f) | 0x30;
        hash[8] = (hash[8] & 0x3f) | 0x80;
        let uuid = hex::encode(hash);
        let formatted_uuid = format!(
            "{}-{}-{}-{}-{}",
            &uuid[0..8],
            &uuid[8..12],
            &uuid[12..16],
            &uuid[16..20],
            &uuid[20..32]
        );

        let avatar = match skin_type.to_lowercase().as_str() {
            "alex" => "https://mc-heads.net/avatar/MHF_Alex/100".to_string(),
            "steve" => "https://mc-heads.net/avatar/MHF_Steve/100".to_string(),
            _ => format!("https://mc-heads.net/avatar/{}/100", clean_user),
        };

        AuthAccount {
            id: format!("local_{}", clean_user.to_lowercase()),
            username: clean_user.to_string(),
            uuid: formatted_uuid,
            // Offline profiles are local identity metadata and never authentication.
            access_token: String::new(),
            refresh_token: None,
            expires_at: 0,
            avatar_url: avatar,
            is_dev_mode: false,
        }
    }

    pub fn add_or_update(&self, account: AuthAccount) -> Result<(), String> {
        let mut storage = self.load();
        if let Some(pos) = storage.accounts.iter().position(|a| a.id == account.id) {
            storage.accounts[pos] = account.clone();
        } else {
            storage.accounts.push(account.clone());
        }
        storage.active_account_id = Some(account.id);
        self.save(&storage)
    }

    pub fn remove_account(&self, account_id: &str) -> Result<(), String> {
        let mut storage = self.load();
        storage.accounts.retain(|a| a.id != account_id);
        if storage.active_account_id.as_deref() == Some(account_id) {
            storage.active_account_id = storage.accounts.first().map(|a| a.id.clone());
        }
        self.save(&storage)
    }

    pub fn set_active(&self, account_id: &str) -> Result<(), String> {
        let mut storage = self.load();
        if storage.accounts.iter().any(|a| a.id == account_id) {
            storage.active_account_id = Some(account_id.to_string());
            self.save(&storage)
        } else {
            Err("Account not found".to_string())
        }
    }

    pub fn get_active(&self) -> Option<AuthAccount> {
        let storage = self.load();
        let id = storage.active_account_id?;
        storage.accounts.into_iter().find(|a| a.id == id)
    }
}

fn redact_credentials(storage: &mut AccountStorage) {
    for account in &mut storage.accounts {
        account.access_token.clear();
        account.refresh_token = None;
        account.expires_at = 0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_account_file_does_not_create_a_fake_profile() {
        let file_name = format!(
            "samrat-empty-account-test-{}-{}.json",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_nanos()
        );
        let path = std::env::temp_dir().join(file_name);
        let manager = AccountManager::with_storage_path(path.clone());

        let storage = manager.load();

        assert!(storage.accounts.is_empty());
        assert!(storage.active_account_id.is_none());
        assert!(!path.exists());
    }

    #[test]
    fn offline_profile_has_no_authentication_token() {
        let profile = AccountManager::create_offline_account("Notch", "steve");
        assert!(profile.access_token.is_empty());
        assert!(profile.refresh_token.is_none());
        assert!(!profile.is_dev_mode);
    }

    #[test]
    fn persisted_account_metadata_does_not_include_credentials() {
        let file_name = format!(
            "samrat-account-test-{}-{}.json",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_nanos()
        );
        let path = std::env::temp_dir().join(file_name);
        let manager = AccountManager::with_storage_path(path.clone());
        let mut account = AccountManager::create_offline_account("Notch", "steve");
        account.access_token = "secret-access-token".to_string();
        account.refresh_token = Some("secret-refresh-token".to_string());
        account.expires_at = 9_999;
        let storage = AccountStorage {
            active_account_id: Some(account.id.clone()),
            accounts: vec![account],
        };
        manager.save(&storage).unwrap();
        let serialized = fs::read_to_string(&path).unwrap();
        assert!(!serialized.contains("secret-access-token"));
        assert!(!serialized.contains("secret-refresh-token"));

        // Simulate a pre-fix account file and ensure old credentials are discarded.
        fs::write(&path, serde_json::to_string(&storage).unwrap()).unwrap();
        let loaded = manager.load();
        assert!(loaded.accounts[0].access_token.is_empty());
        assert!(loaded.accounts[0].refresh_token.is_none());
        assert_eq!(loaded.accounts[0].expires_at, 0);
        fs::remove_file(path).unwrap();
    }
}

fn md5_hash(data: &[u8]) -> [u8; 16] {
    use md5::{Digest, Md5};
    let result = Md5::digest(data);
    let mut out = [0u8; 16];
    out.copy_from_slice(&result);
    out
}
