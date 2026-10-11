use super::microsoft_auth::AuthAccount;
use crate::security::atomic_file::write_atomically;
use crate::security::path_guard::get_samrat_data_dir;
use serde::{Deserialize, Serialize};
use std::io::Read;
use std::fs;
use std::path::PathBuf;

const MAX_ACCOUNT_STORAGE_BYTES: usize = 1024 * 1024;
const MAX_STORED_ACCOUNTS: usize = 128;

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
        Self {
            storage_path: dir.join("accounts.json"),
        }
    }

    #[cfg(test)]
    fn with_storage_path(storage_path: PathBuf) -> Self {
        Self { storage_path }
    }

    pub fn load(&self) -> Result<AccountStorage, String> {
        let file = match fs::File::open(&self.storage_path) {
            Ok(file) => file,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                return Ok(AccountStorage::default());
            }
            Err(error) => return Err(format!("Could not read account storage: {error}")),
        };
        let mut bytes = Vec::with_capacity(MAX_ACCOUNT_STORAGE_BYTES.min(4096));
        file.take((MAX_ACCOUNT_STORAGE_BYTES + 1) as u64)
            .read_to_end(&mut bytes)
            .map_err(|error| format!("Could not read account storage: {error}"))?;
        if bytes.len() > MAX_ACCOUNT_STORAGE_BYTES {
            return Err("Account storage exceeds the 1 MiB size limit and was left unchanged.".into());
        }
        let content = String::from_utf8(bytes)
            .map_err(|error| format!("Account storage is not valid UTF-8 and was left unchanged: {error}"))?;
        let mut storage = serde_json::from_str::<AccountStorage>(&content)
            .map_err(|error| format!("Account storage is invalid and was left unchanged: {error}"))?;
        if storage.accounts.len() > MAX_STORED_ACCOUNTS {
            return Err(format!("Account storage exceeds the {MAX_STORED_ACCOUNTS} account limit and was left unchanged."));
        }
        // Tokens are never restored from launcher JSON. Until an OS-backed
        // credential store is wired, persisted accounts are metadata only.
        redact_credentials(&mut storage);
        Ok(storage)
    }

    pub fn save(&self, storage: &AccountStorage) -> Result<(), String> {
        let mut persistable = storage.clone();
        redact_credentials(&mut persistable);
        let json = serde_json::to_string_pretty(&persistable).map_err(|e| e.to_string())?;
        write_atomically(&self.storage_path, json.as_bytes())
            .map_err(|error| format!("Could not atomically save account metadata: {error}"))
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
        let mut storage = self.load()?;
        if let Some(pos) = storage.accounts.iter().position(|a| a.id == account.id) {
            storage.accounts[pos] = account.clone();
        } else {
            storage.accounts.push(account.clone());
        }
        storage.active_account_id = Some(account.id);
        self.save(&storage)
    }

    pub fn remove_account(&self, account_id: &str) -> Result<(), String> {
        let mut storage = self.load()?;
        storage.accounts.retain(|a| a.id != account_id);
        if storage.active_account_id.as_deref() == Some(account_id) {
            storage.active_account_id = storage.accounts.first().map(|a| a.id.clone());
        }
        self.save(&storage)
    }

    pub fn set_active(&self, account_id: &str) -> Result<(), String> {
        let mut storage = self.load()?;
        if storage.accounts.iter().any(|a| a.id == account_id) {
            storage.active_account_id = Some(account_id.to_string());
            self.save(&storage)
        } else {
            Err("Account not found".to_string())
        }
    }

    pub fn get_active(&self) -> Result<Option<AuthAccount>, String> {
        let storage = self.load()?;
        let Some(id) = storage.active_account_id else { return Ok(None) };
        Ok(storage.accounts.into_iter().find(|a| a.id == id))
    }
}

fn redact_credentials(storage: &mut AccountStorage) {
    for account in &mut storage.accounts {
        account.access_token.clear();
        account.refresh_token = None;
        account.expires_at = 0;
    }
}

fn md5_hash(data: &[u8]) -> [u8; 16] {
    use md5::{Digest, Md5};
    let result = Md5::digest(data);
    let mut out = [0u8; 16];
    out.copy_from_slice(&result);
    out
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

        let storage = manager.load().unwrap();

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
        let loaded = manager.load().unwrap();
        assert!(loaded.accounts[0].access_token.is_empty());
        assert!(loaded.accounts[0].refresh_token.is_none());
        assert_eq!(loaded.accounts[0].expires_at, 0);
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn corrupt_account_file_is_reported_and_never_overwritten_by_add() {
        let file_name = format!(
            "samrat-corrupt-account-test-{}-{}.json",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_nanos()
        );
        let path = std::env::temp_dir().join(file_name);
        let original = b"{broken account metadata";
        fs::write(&path, original).unwrap();
        let manager = AccountManager::with_storage_path(path.clone());

        let error = manager.load().unwrap_err();
        assert!(error.contains("left unchanged"));
        assert!(manager.add_or_update(AccountManager::create_offline_account("Notch", "steve")).is_err());
        assert_eq!(fs::read(&path).unwrap().as_slice(), original);
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn oversized_account_file_is_rejected_without_reading_or_overwriting_it() {
        let file_name = format!(
            "samrat-oversized-account-test-{}-{}.json",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_nanos()
        );
        let path = std::env::temp_dir().join(file_name);
        let original = vec![b'x'; MAX_ACCOUNT_STORAGE_BYTES + 1];
        fs::write(&path, &original).unwrap();
        let manager = AccountManager::with_storage_path(path.clone());

        assert!(manager.load().unwrap_err().contains("1 MiB size limit"));
        assert!(manager.add_or_update(AccountManager::create_offline_account("Notch", "steve")).is_err());
        assert_eq!(fs::read(&path).unwrap(), original);
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn account_count_limit_is_enforced_without_replacing_storage() {
        let file_name = format!(
            "samrat-account-count-test-{}-{}.json",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_nanos()
        );
        let path = std::env::temp_dir().join(file_name);
        let account = AccountManager::create_offline_account("Notch", "steve");
        let storage = AccountStorage { active_account_id: Some(account.id.clone()), accounts: vec![account; MAX_STORED_ACCOUNTS + 1] };
        let original = serde_json::to_vec(&storage).unwrap();
        fs::write(&path, &original).unwrap();
        let manager = AccountManager::with_storage_path(path.clone());

        assert!(manager.load().unwrap_err().contains("128 account limit"));
        assert!(manager.remove_account("local_notch").is_err());
        assert_eq!(fs::read(&path).unwrap(), original);
        fs::remove_file(path).unwrap();
    }
}
