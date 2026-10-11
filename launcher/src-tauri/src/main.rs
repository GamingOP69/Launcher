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
use commands::{offline_launch_config, AppState};
use launch::launcher_engine::LauncherEngine;
use std::sync::Mutex;

fn main() {
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .init();

    log::info!("Starting Samrat Launcher...");

    if std::env::args().any(|arg| arg == "--ci-minecraft-smoke") {
        if std::env::var("SAMRAT_CI_GAME_SMOKE").ok().as_deref() != Some("1") {
            log::error!("The Minecraft smoke mode requires the CI-only environment opt-in.");
            std::process::exit(2);
        }
        if let Err(error) = run_ci_minecraft_smoke() {
            log::error!("Minecraft smoke failed: {error}");
            std::process::exit(1);
        }
        return;
    }

    let state = AppState {
        engine: LauncherEngine::new(),
        account_manager: AccountManager::new(),
        logs: Mutex::new(Vec::new()),
    };

    tauri::Builder::default()
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

fn run_ci_minecraft_smoke() -> Result<(), String> {
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .map_err(|error| format!("Could not start smoke runtime: {error}"))?;
    let data_dir = security::path_guard::get_samrat_data_dir();
    std::fs::create_dir_all(&data_dir)
        .map_err(|error| format!("Could not create launcher data directory: {error}"))?;
    let marker = data_dir.join("ci-smoke-result.json");
    let result = runtime.block_on(async {
        let account = AccountManager::create_offline_account("SamratCiSmoke", "steve");
        let config = offline_launch_config(&account, Default::default())?;
        let engine = LauncherEngine::new();
        let pid = engine.launch_async(config).await?;
        std::fs::write(
            &marker,
            serde_json::to_vec(&serde_json::json!({"status":"process_started","pid":pid}))
                .map_err(|error| error.to_string())?,
        )
        .map_err(|error| format!("Could not write smoke marker: {error}"))?;

        for _ in 0..90 {
            if !engine.is_running() {
                return Err("Minecraft process exited before the smoke window ended.".to_string());
            }
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        }
        engine.terminate()?;
        Ok(())
    });
    match result {
        Ok(()) => {
            std::fs::write(&marker, br#"{"status":"process_survived_smoke_window"}"#)
                .map_err(|error| format!("Could not finalize smoke marker: {error}"))?;
            Ok(())
        }
        Err(error) => {
            let _ = std::fs::write(
                &marker,
                serde_json::to_vec(&serde_json::json!({"status":"failed","error":error}))
                    .unwrap_or_default(),
            );
            Err(error)
        }
    }
}
