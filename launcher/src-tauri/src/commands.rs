use crate::auth::account_manager::{AccountManager, AccountStorage};
use crate::auth::microsoft_auth::AuthAccount;
use crate::java::detector::{self, JavaRuntimeInfo};
use crate::launch::args_builder::LaunchConfig;
use crate::launch::launcher_engine::LauncherEngine;
use crate::security::path_guard::{get_samrat_data_dir, is_safe_subpath, sanitize_filename};
use crate::updater::updater_service::{UpdateCheckResult, UpdaterService};
use serde::{Deserialize, Serialize};
use std::process::Command;
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
    let sanitized_user = sanitize_filename(&config.username);
    log::info!("Launch command invoked for user: {}", sanitized_user);

    if let Ok(mut logs) = state.logs.lock() {
        logs.push(format!("[LAUNCHER] Launching client for user: {}", sanitized_user));
        logs.push(format!("[LAUNCHER] Target: Minecraft 1.8.9 | RAM: {} MB", config.ram_mb));
    }

    state.engine.launch(config)
}

#[tauri::command]
pub async fn terminate_game(state: State<'_, AppState>) -> Result<(), String> {
    if let Ok(mut logs) = state.logs.lock() {
        logs.push("[LAUNCHER] Terminating client process...".to_string());
    }
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
pub async fn add_offline_account(
    state: State<'_, AppState>,
    username: String,
    skin_type: Option<String>,
) -> Result<AuthAccount, String> {
    let skin = skin_type.unwrap_or_else(|| "custom".to_string());
    let account = AccountManager::create_offline_account(&username, &skin);
    state.account_manager.add_or_update(account.clone())?;

    if let Ok(mut logs) = state.logs.lock() {
        logs.push(format!("[AUTH] Created local offline account for: {}", account.username));
    }

    Ok(account)
}

#[tauri::command]
pub async fn get_accounts(state: State<'_, AppState>) -> Result<AccountStorage, String> {
    Ok(state.account_manager.load())
}

#[tauri::command]
pub async fn get_active_account(state: State<'_, AppState>) -> Result<Option<AuthAccount>, String> {
    Ok(state.account_manager.get_active())
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
pub async fn open_folder(folder_type: String) -> Result<String, String> {
    let samrat_dir = get_samrat_data_dir();
    let target_dir = match folder_type.to_lowercase().as_str() {
        "mods" => samrat_dir.join("game").join("mods"),
        "logs" => samrat_dir.join("logs"),
        "profiles" => samrat_dir.join("profiles"),
        "game" => samrat_dir.join("game"),
        _ => samrat_dir,
    };

    let _ = std::fs::create_dir_all(&target_dir);

    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("explorer.exe")
            .arg(&target_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open")
            .arg(&target_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        let _ = Command::new("xdg-open")
            .arg(&target_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(target_dir.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn check_updates(channel: Option<String>) -> Result<UpdateCheckResult, String> {
    let ch = channel.unwrap_or_else(|| "stable".to_string());
    UpdaterService::check_for_updates("1.0.0", &ch).await
}

#[tauri::command]
pub async fn verify_update_file(file_path: String, expected_sha256: String) -> Result<bool, String> {
    if !is_safe_subpath(get_samrat_data_dir(), &file_path) {
        return Err("Target path is outside safe data directory".to_string());
    }
    UpdaterService::verify_file_sha256(&file_path, &expected_sha256)
}

#[tauri::command]
pub async fn get_system_info(state: State<'_, AppState>) -> Result<SystemDiagnostics, String> {
    if let Ok(mut logs) = state.logs.lock() {
        logs.push("[SYSTEM] Telemetry polled".to_string());
    }

    Ok(SystemDiagnostics {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        num_cpus: num_cpus_fallback(),
        total_memory_mb: 16384,
        free_memory_mb: 8192,
    })
}

#[tauri::command]
pub async fn get_launcher_logs(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let logs = state.logs.lock().map_err(|e| e.to_string())?;
    Ok(logs.clone())
}

fn num_cpus_fallback() -> usize {
    std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
}
