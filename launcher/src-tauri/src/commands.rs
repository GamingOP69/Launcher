use crate::auth::account_manager::{AccountManager, AccountStorage};
use crate::auth::microsoft_auth::{self, AuthAccount, DeviceCodeResponse};
use crate::java::detector::{self, JavaRuntimeInfo};
use crate::launch::args_builder::LaunchConfig;
use crate::launch::launcher_engine::LauncherEngine;
use crate::updater::updater_service::{UpdateCheckResult, UpdaterService};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub engine: LauncherEngine,
    pub account_manager: AccountManager,
    pub logs: Mutex<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemDiagnostics {
    pub os: String,
    pub arch: String,
    pub num_cpus: usize,
    pub total_memory_mb: u64,
    pub free_memory_mb: u64,
}

#[tauri::command]
pub async fn launch_game(state: State<'_, AppState>, config: LaunchConfig) -> Result<u32, String> {
    log::info!("Launch command invoked for user: {}", config.username);
    state.engine.launch(config)
}

#[tauri::command]
pub async fn terminate_game(state: State<'_, AppState>) -> Result<(), String> {
    state.engine.terminate()
}

#[tauri::command]
pub async fn is_game_running(state: State<'_, AppState>) -> Result<bool, String> {
    Ok(state.engine.is_running())
}

#[tauri::command]
pub async fn detect_java() -> Result<Vec<JavaRuntimeInfo>, String> {
    Ok(detector::detect_java_installations())
}

#[tauri::command]
pub async fn request_ms_device_code() -> Result<DeviceCodeResponse, String> {
    microsoft_auth::request_device_code().await
}

#[tauri::command]
pub async fn poll_ms_auth(state: State<'_, AppState>, device_code: String, interval: u64) -> Result<AuthAccount, String> {
    let account = microsoft_auth::poll_device_code_token(&device_code, interval, 30).await?;
    state.account_manager.add_or_update(account.clone())?;
    Ok(account)
}

#[tauri::command]
pub async fn add_dev_account(state: State<'_, AppState>, username: String) -> Result<AuthAccount, String> {
    let dev = microsoft_auth::create_dev_sandbox_account(&username);
    state.account_manager.add_or_update(dev.clone())?;
    Ok(dev)
}

#[tauri::command]
pub async fn get_accounts(state: State<'_, AppState>) -> Result<AccountStorage, String> {
    Ok(state.account_manager.load())
}

#[tauri::command]
pub async fn set_active_account(state: State<'_, AppState>, account_id: String) -> Result<(), String> {
    state.account_manager.set_active(&account_id)
}

#[tauri::command]
pub async fn remove_account(state: State<'_, AppState>, account_id: String) -> Result<(), String> {
    state.account_manager.remove_account(&account_id)
}

#[tauri::command]
pub async fn check_updates(channel: Option<String>) -> Result<UpdateCheckResult, String> {
    let ch = channel.unwrap_or_else(|| "stable".to_string());
    UpdaterService::check_for_updates("1.0.0", &ch).await
}

#[tauri::command]
pub async fn get_system_info() -> Result<SystemDiagnostics, String> {
    Ok(SystemDiagnostics {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        num_cpus: num_cpus_fallback(),
        total_memory_mb: 16384,
        free_memory_mb: 8192,
    })
}

fn num_cpus_fallback() -> usize {
    std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
}
