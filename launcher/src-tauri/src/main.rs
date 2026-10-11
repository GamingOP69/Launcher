#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;
mod commands;
mod java;
mod launch;
mod launcher_settings;
mod security;
mod updater;

#[cfg(test)]
mod tests;

use auth::account_manager::AccountManager;
use commands::{offline_launch_config, AppState};
use launch::launcher_engine::LauncherEngine;
use std::sync::Mutex;

fn main() {
    let smoke_mode = std::env::args().any(|arg| arg == "--ci-minecraft-smoke");
    let smoke_log = if smoke_mode {
        let log_dir = security::path_guard::get_samrat_data_dir().join("logs");
        std::fs::create_dir_all(&log_dir)
            .ok()
            .and_then(|_| {
                std::fs::OpenOptions::new()
                    .create(true)
                    .truncate(true)
                    .write(true)
                    .open(log_dir.join("ci-game-smoke.log"))
                    .ok()
            })
    } else {
        None
    };
    let mut logger = env_logger::Builder::from_default_env();
    logger.filter_level(log::LevelFilter::Info);
    if let Some(file) = smoke_log {
        logger.target(env_logger::Target::Pipe(Box::new(file)));
    }
    logger.init();

    log::info!("Starting Samrat Launcher...");

    if smoke_mode {
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
            launcher_settings::get_launcher_settings,
            launcher_settings::save_launcher_settings,
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
        let forge_mod_jar = std::env::var_os("SAMRAT_FORGE_MOD_JAR")
            .map(std::path::PathBuf::from)
            .ok_or_else(|| "CI package smoke did not receive the packaged Forge mod resource path.".to_string())?;
        let pid = engine.launch_async(config, Some(forge_mod_jar)).await?;
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
    let paths = [
        data_dir.join("logs").join("ci-game-smoke.log"),
        data_dir.join("game").join("logs").join("latest.log"),
    ];
    let mut tails = Vec::new();
    for path in paths {
        let Ok(mut file) = std::fs::File::open(&path) else {
            continue;
        };
        let Ok(metadata) = file.metadata() else {
            continue;
        };
        let start = metadata.len().saturating_sub(MAX_TAIL_BYTES);
        if file.seek(SeekFrom::Start(start)).is_err() {
            continue;
        }
        let mut bytes = Vec::with_capacity((metadata.len() - start) as usize);
        if file.read_to_end(&mut bytes).is_err() {
            continue;
        }
        let text = String::from_utf8_lossy(&bytes);
        let mut lines: Vec<String> = text
            .lines()
            .rev()
            .take(60)
            .map(sanitize_smoke_log_line)
            .collect();
        lines.reverse();
        if !lines.is_empty() {
            tails.push(format!("{} tail:\n{}", path.display(), lines.join("\n")));
        }
    }
    if tails.is_empty() {
        "No launcher or Minecraft log file was created.".to_string()
    } else {
        tails.join("\n")
    }
}

fn sanitize_smoke_log_line(line: &str) -> String {
    security::sanitizer::sanitize_log(&line.chars().take(1200).collect::<String>())
}

#[cfg(test)]
mod smoke_log_tests {
    use super::sanitize_smoke_log_line;

    #[test]
    fn smoke_log_excerpt_is_bounded_and_redacts_credentials() {
        let secret_line = format!("access_token=secret-value {}", "x".repeat(2000));
        let excerpt = sanitize_smoke_log_line(&secret_line);

        assert!(excerpt.chars().count() <= 1200);
        assert!(!excerpt.contains("secret-value"));
        assert!(excerpt.contains("REDACTED"));
    }
}
