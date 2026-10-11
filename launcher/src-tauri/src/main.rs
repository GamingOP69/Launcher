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
                return Err(format!(
                    "Minecraft process exited before the smoke window ended. {}",
                    read_minecraft_log_tail(&data_dir)
                ));
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

fn read_minecraft_log_tail(data_dir: &std::path::Path) -> String {
    use std::io::{Read, Seek, SeekFrom};

    const MAX_TAIL_BYTES: u64 = 32 * 1024;
    let path = data_dir.join("game").join("logs").join("latest.log");
    let Ok(mut file) = std::fs::File::open(&path) else {
        return format!("Minecraft latest.log was not created at {}.", path.display());
    };
    let Ok(metadata) = file.metadata() else {
        return "Minecraft latest.log metadata could not be read.".to_string();
    };
    let start = metadata.len().saturating_sub(MAX_TAIL_BYTES);
    if file.seek(SeekFrom::Start(start)).is_err() {
        return "Minecraft latest.log could not be read.".to_string();
    }
    let mut bytes = Vec::with_capacity((metadata.len() - start) as usize);
    if file.read_to_end(&mut bytes).is_err() {
        return "Minecraft latest.log could not be read.".to_string();
    }
    let text = String::from_utf8_lossy(&bytes);
    let mut lines: Vec<String> = text
        .lines()
        .rev()
        .take(60)
        .map(|line| security::sanitizer::sanitize_log(&line.chars().take(1200).collect::<String>()))
        .collect();
    lines.reverse();
    if lines.is_empty() {
        "Minecraft latest.log was empty.".to_string()
    } else {
        format!("Minecraft latest.log tail:\n{}", lines.join("\n"))
    }
}
