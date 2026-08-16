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

    pub fn load(&self) -> AccountStorage {
        if !self.storage_path.exists() {
            let default_dev = super::microsoft_auth::create_dev_sandbox_account("SamratDeveloper");
            let storage = AccountStorage {
                active_account_id: Some(default_dev.id.clone()),
                accounts: vec![default_dev],
            };
            let _ = self.save(&storage);
            return storage;
        }

        match fs::read_to_string(&self.storage_path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => AccountStorage::default(),
        }
    }

    pub fn save(&self, storage: &AccountStorage) -> Result<(), String> {
        let json = serde_json::to_string_pretty(storage).map_err(|e| e.to_string())?;
        fs::write(&self.storage_path, json).map_err(|e| e.to_string())
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
