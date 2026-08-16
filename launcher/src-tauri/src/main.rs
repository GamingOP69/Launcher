#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;
mod commands;
mod java;
mod launch;
mod security;
mod updater;

#[cfg(test)]
mod tests;

use auth::account_manager::AccountManager;
use commands::AppState;
use launch::launcher_engine::LauncherEngine;
use std::sync::Mutex;

fn main() {
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .init();

    log::info!("Starting Samrat Launcher...");

    let state = AppState {
        engine: LauncherEngine::new(),
        account_manager: AccountManager::new(),
        logs: Mutex::new(Vec::new()),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::check_client_installed,
            commands::download_client,
            commands::launch_game,
            commands::terminate_game,
            commands::is_game_running,
            commands::detect_java,
            commands::add_offline_account,
            commands::get_accounts,
            commands::get_active_account,
            commands::set_active_account,
            commands::remove_account,
            commands::open_folder,
            commands::check_updates,
            commands::verify_update_file,
            commands::get_system_info,
            commands::get_launcher_logs,
            commands::get_client_modules,
            commands::toggle_client_module,
            commands::get_saved_profiles,
            commands::save_custom_profile,
            commands::delete_custom_profile,
            commands::get_curated_mods,
            commands::download_curated_mod,
            commands::delete_mod_file
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Samrat Launcher");
}
