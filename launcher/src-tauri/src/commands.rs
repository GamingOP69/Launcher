use crate::auth::account_manager::{AccountManager, AccountStorage};
use crate::auth::microsoft_auth::AuthAccount;
use crate::java::detector::{self, JavaRuntimeInfo};
use crate::launch::args_builder::LaunchConfig;
use crate::launch::launcher_engine::LauncherEngine;
use crate::security::path_guard::{get_samrat_data_dir, is_safe_subpath, sanitize_filename};
use crate::updater::updater_service::{UpdateCheckResult, UpdaterService};
use serde::{Deserialize, Serialize};

use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};

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

#[derive(Debug, Serialize, Deserialize)]
pub struct ClientInstallStatus {
    pub installed: bool,
    pub jar_path: String,
    pub jar_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientModuleDto {
    pub id: String,
    pub name: String,
    pub category: String,
    pub description: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileDto {
    pub id: String,
    pub name: String,
    pub description: String,
    pub is_preset: bool,
    pub performance_preset: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CuratedModDto {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub category: String,
    pub download_url: String,
    pub filename: String,
    pub installed: bool,
    pub size_kb: u64,
}

#[tauri::command]
pub async fn check_client_installed() -> Result<ClientInstallStatus, String> {
    let samrat_dir = get_samrat_data_dir();
    let candidates = [
        samrat_dir.join("client").join("samrat-client-1.8.9.jar"),
        samrat_dir.join("client").join("samrat-client-1.8.9-1.0.0.jar"),
        samrat_dir.join("versions").join("1.8.9").join("samrat-client-1.8.9.jar"),
        samrat_dir.join("game").join("samrat-client-1.8.9.jar"),
        PathBuf::from("client/build/libs/samrat-client-1.8.9.jar"),
        PathBuf::from("client/build/libs/samrat-client-1.8.9-1.0.0.jar"),
    ];

    for cand in &candidates {
        if cand.exists() && cand.is_file() {
            let size = std::fs::metadata(cand).map(|m| m.len()).unwrap_or(0);
            return Ok(ClientInstallStatus {
                installed: true,
                jar_path: cand.to_string_lossy().to_string(),
                jar_size_bytes: size,
            });
        }
    }

    let default_path = samrat_dir.join("client").join("samrat-client-1.8.9.jar");
    Ok(ClientInstallStatus {
        installed: false,
        jar_path: default_path.to_string_lossy().to_string(),
        jar_size_bytes: 0,
    })
}

#[tauri::command]
pub async fn download_client(app: AppHandle, state: State<'_, AppState>) -> Result<String, String> {
    let samrat_dir = get_samrat_data_dir();
    let client_dir = samrat_dir.join("client");
    let jar_path = client_dir.join("samrat-client-1.8.9.jar");

    let _ = std::fs::create_dir_all(&client_dir);

    let _ = app.emit("install_progress", serde_json::json!({"stage": "starting", "percent": 0}));

    // Check if a local built jar exists first (e.g. during local testing or workspace builds)
    let local_candidates = [
        PathBuf::from("client/build/libs/samrat-client-1.8.9.jar"),
        PathBuf::from("client/build/libs/samrat-client-1.8.9-1.0.0.jar"),
        PathBuf::from("../client/build/libs/samrat-client-1.8.9.jar"),
        PathBuf::from("../client/build/libs/samrat-client-1.8.9-1.0.0.jar"),
        samrat_dir.join("versions").join("1.8.9").join("samrat-client-1.8.9.jar"),
    ];

    for local in &local_candidates {
        if local.exists() && local.is_file() {
            if std::fs::copy(local, &jar_path).is_ok() {
                if let Ok(mut logs) = state.logs.lock() {
                    logs.push(format!("[INSTALL] Installed client from local build: {}", local.display()));
                }
                let _ = app.emit("install_progress", serde_json::json!({"stage": "done", "percent": 100}));
                return Ok(jar_path.to_string_lossy().to_string());
            }
        }
    }

    let client = reqwest::Client::builder()
        .user_agent("SamratLauncher/1.0.0")
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))?;

    let mut download_urls = Vec::new();

    // 1. Query GitHub Releases API to discover actual published release asset URLs
    if let Ok(resp) = client.get("https://api.github.com/repos/GamingOP69/Launcher/releases").send().await {
        if resp.status().is_success() {
            if let Ok(releases) = resp.json::<serde_json::Value>().await {
                if let Some(rel_list) = releases.as_array() {
                    for rel in rel_list {
                        if let Some(assets) = rel.get("assets").and_then(|a| a.as_array()) {
                            for asset in assets {
                                if let (Some(name), Some(url)) = (
                                    asset.get("name").and_then(|n| n.as_str()),
                                    asset.get("browser_download_url").and_then(|u| u.as_str())
                                ) {
                                    if name.contains("samrat-client") && name.ends_with(".jar") {
                                        download_urls.push(url.to_string());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 2. Add standard direct fallback URLs
    download_urls.push("https://github.com/GamingOP69/Launcher/releases/latest/download/samrat-client-1.8.9.jar".to_string());
    download_urls.push("https://github.com/GamingOP69/Launcher/releases/latest/download/samrat-client-1.8.9-1.0.0.jar".to_string());

    let mut last_error = String::new();

    for url in download_urls {
        if let Ok(mut logs) = state.logs.lock() {
            logs.push(format!("[INSTALL] Attempting download from: {}", url));
        }

        match client.get(&url).send().await {
            Ok(response) if response.status().is_success() => {
                let _ = app.emit("install_progress", serde_json::json!({"stage": "downloading", "percent": 50}));

                match response.bytes().await {
                    Ok(bytes) if !bytes.is_empty() => {
                        let _ = app.emit("install_progress", serde_json::json!({"stage": "writing", "percent": 90}));

                        if let Err(e) = std::fs::write(&jar_path, &bytes) {
                            return Err(format!("Failed to write client JAR: {}", e));
                        }

                        if let Ok(mut logs) = state.logs.lock() {
                            logs.push(format!(
                                "[INSTALL] Client downloaded successfully: {} ({} bytes)",
                                jar_path.display(),
                                bytes.len()
                            ));
                        }

                        let _ = app.emit("install_progress", serde_json::json!({"stage": "done", "percent": 100}));
                        return Ok(jar_path.to_string_lossy().to_string());
                    }
                    Ok(_) => {
                        last_error = "Downloaded file was empty".to_string();
                    }
                    Err(e) => {
                        last_error = format!("Failed to read stream: {}", e);
                    }
                }
            }
            Ok(response) => {
                last_error = format!("Server returned HTTP {}", response.status());
            }
            Err(e) => {
                last_error = format!("Network error: {}", e);
            }
        }
    }

    Err(format!(
        "Unable to download client JAR: {}. If a new release was just pushed, GitHub Actions is still building it (takes ~2 minutes). Please try again shortly.",
        last_error
    ))
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
        "client" => samrat_dir.join("client"),
        _ => samrat_dir,
    };

    let _ = std::fs::create_dir_all(&target_dir);

    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("explorer.exe").arg(&target_dir).spawn();
    }
    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open").arg(&target_dir).spawn();
    }
    #[cfg(target_os = "linux")]
    {
        let _ = Command::new("xdg-open").arg(&target_dir).spawn();
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
pub async fn get_system_info(_state: State<'_, AppState>) -> Result<SystemDiagnostics, String> {
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

// ─── Persistent Module Configuration Sync ────────────────────────────────────

fn default_modules_list() -> Vec<ClientModuleDto> {
    vec![
        ClientModuleDto { id: "fps".into(), name: "FPS Display".into(), category: "HUD".into(), description: "Real-time framerate and frame pacing monitor".into(), enabled: true },
        ClientModuleDto { id: "cps".into(), name: "CPS Display".into(), category: "HUD".into(), description: "Accurate click-per-second tracker for LMB and RMB".into(), enabled: true },
        ClientModuleDto { id: "ping".into(), name: "Ping Display".into(), category: "HUD".into(), description: "Round-trip server latency and network jitter".into(), enabled: true },
        ClientModuleDto { id: "keystrokes".into(), name: "Keystrokes".into(), category: "HUD".into(), description: "Visual overlay for WASD, Space, and mouse clicks".into(), enabled: true },
        ClientModuleDto { id: "armor".into(), name: "Armor Status".into(), category: "HUD".into(), description: "Displays armor durability and held items".into(), enabled: true },
        ClientModuleDto { id: "potions".into(), name: "Potion Status".into(), category: "HUD".into(), description: "Active potion effects and amplifier timers".into(), enabled: true },
        ClientModuleDto { id: "coords".into(), name: "Coordinates".into(), category: "HUD".into(), description: "Precise XYZ player position and biome".into(), enabled: true },
        ClientModuleDto { id: "bed_matrix".into(), name: "Bed Status Matrix".into(), category: "Bedwars".into(), description: "Live tracking of all 8 team beds and active players".into(), enabled: true },
        ClientModuleDto { id: "res_timers".into(), name: "Resource Timer".into(), category: "Bedwars".into(), description: "Diamond and Emerald generator countdown timers".into(), enabled: true },
        ClientModuleDto { id: "height_alert".into(), name: "Height Alert".into(), category: "Bedwars".into(), description: "Visual warning when approaching max build height or void".into(), enabled: true },
        ClientModuleDto { id: "combo".into(), name: "Combo Counter".into(), category: "PvP".into(), description: "Consecutive hit tracker without damage tick reset".into(), enabled: true },
        ClientModuleDto { id: "crosshair".into(), name: "Custom Crosshair".into(), category: "PvP".into(), description: "Customizable geometric crosshair with dynamic spread".into(), enabled: true },
        ClientModuleDto { id: "hit_color".into(), name: "Hit Color Modifier".into(), category: "PvP".into(), description: "Customizable entity damage flash color".into(), enabled: true },
        ClientModuleDto { id: "toggle_sprint".into(), name: "Toggle Sprint".into(), category: "PvP".into(), description: "Persistent sprint status overlay on HUD".into(), enabled: true },
        ClientModuleDto { id: "fastmath".into(), name: "FastMath Tables".into(), category: "Performance".into(), description: "Replaces Math trig calls with precomputed 65,536 tables".into(), enabled: true },
        ClientModuleDto { id: "culling".into(), name: "Entity & Tile Culling".into(), category: "Performance".into(), description: "Skips rendering entities outside camera view frustum".into(), enabled: true },
        ClientModuleDto { id: "smart_anim".into(), name: "Smart Animations".into(), category: "Performance".into(), description: "Pauses texture animations when off-screen".into(), enabled: true },
        ClientModuleDto { id: "zoom".into(), name: "OptiFine Zoom".into(), category: "Player".into(), description: "Cinematic smooth zoom magnification on C key".into(), enabled: true },
        ClientModuleDto { id: "low_fire".into(), name: "Low Fire".into(), category: "Visual".into(), description: "Lowers first-person fire rendering overlay in PvP".into(), enabled: true },
        ClientModuleDto { id: "old_anim".into(), name: "1.7 Old Animations".into(), category: "Visual".into(), description: "Classic 1.7 blockhit, sword swing, and rod animations".into(), enabled: true },
        ClientModuleDto { id: "block_overlay".into(), name: "Block Overlay".into(), category: "Visual".into(), description: "Customizable block bounding box outline".into(), enabled: true },
        ClientModuleDto { id: "item_physics".into(), name: "3D Item Physics".into(), category: "Visual".into(), description: "Realistic 3D physics for dropped ground items".into(), enabled: true },
        ClientModuleDto { id: "freelook".into(), name: "360° Freelook".into(), category: "Player".into(), description: "Enables 360-degree camera rotation on key press".into(), enabled: true },
        ClientModuleDto { id: "auto_gg".into(), name: "Auto GG Responder".into(), category: "Player".into(), description: "Sends 'gg' in chat upon game completion".into(), enabled: true },
    ]
}

#[tauri::command]
pub async fn get_client_modules() -> Result<Vec<ClientModuleDto>, String> {
    let samrat_dir = get_samrat_data_dir();
    let config_file = samrat_dir.join("config.json");
    let mut defaults = default_modules_list();

    if config_file.exists() {
        if let Ok(content) = std::fs::read_to_string(&config_file) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(mods_obj) = json.get("modules").and_then(|m| m.as_object()) {
                    for module in &mut defaults {
                        if let Some(mod_data) = mods_obj.get(&module.name) {
                            if let Some(enabled) = mod_data.get("enabled").and_then(|e| e.as_bool()) {
                                module.enabled = enabled;
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(defaults)
}

#[tauri::command]
pub async fn toggle_client_module(
    state: State<'_, AppState>,
    module_name: String,
    enabled: bool,
) -> Result<(), String> {
    let samrat_dir = get_samrat_data_dir();
    let _ = std::fs::create_dir_all(&samrat_dir);
    let config_file = samrat_dir.join("config.json");

    let mut root: serde_json::Value = if config_file.exists() {
        std::fs::read_to_string(&config_file)
            .ok()
            .and_then(|c| serde_json::from_str(&c).ok())
            .unwrap_or_else(|| serde_json::json!({}))
    } else {
        serde_json::json!({})
    };

    if !root.is_object() {
        root = serde_json::json!({});
    }

    if root.get("configVersion").is_none() {
        root["configVersion"] = serde_json::json!(1);
    }
    if root.get("activeProfile").is_none() {
        root["activeProfile"] = serde_json::json!("Default");
    }
    if root.get("rightShiftKey").is_none() {
        root["rightShiftKey"] = serde_json::json!(54);
    }

    if root.get("modules").is_none() || !root["modules"].is_object() {
        root["modules"] = serde_json::json!({});
    }

    if root["modules"].get(&module_name).is_none() || !root["modules"][&module_name].is_object() {
        root["modules"][&module_name] = serde_json::json!({
            "enabled": enabled,
            "keybind": 0,
            "settings": {}
        });
    } else {
        root["modules"][&module_name]["enabled"] = serde_json::json!(enabled);
    }

    let serialized = serde_json::to_string_pretty(&root)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    std::fs::write(&config_file, serialized)
        .map_err(|e| format!("Failed to write config.json: {}", e))?;

    if let Ok(mut logs) = state.logs.lock() {
        logs.push(format!(
            "[CONFIG] Module '{}' set to enabled={}",
            module_name, enabled
        ));
    }

    Ok(())
}

#[tauri::command]
pub async fn get_saved_profiles() -> Result<Vec<ProfileDto>, String> {
    let mut profiles = vec![
        ProfileDto { id: "Default".into(), name: "Default".into(), description: "Standard balanced client configuration".into(), is_preset: true, performance_preset: "BALANCED".into() },
        ProfileDto { id: "Bedwars".into(), name: "Bedwars".into(), description: "Optimized HUD, team trackers and resource timers".into(), is_preset: true, performance_preset: "BALANCED".into() },
        ProfileDto { id: "PvP".into(), name: "PvP".into(), description: "Aggressive combo tracking and custom crosshair".into(), is_preset: true, performance_preset: "HIGH_FPS".into() },
        ProfileDto { id: "FPS".into(), name: "FPS Boost".into(), description: "Maximum framerate tuning with aggressive culling".into(), is_preset: true, performance_preset: "HIGH_FPS".into() },
        ProfileDto { id: "Low-End PC".into(), name: "Low-End PC".into(), description: "Ultra-lightweight potato settings".into(), is_preset: true, performance_preset: "ULTRA_FPS".into() },
    ];

    let samrat_dir = get_samrat_data_dir();
    let profiles_dir = samrat_dir.join("profiles");
    if profiles_dir.exists() {
        if let Ok(entries) = std::fs::read_dir(profiles_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
                    let stem = path.file_stem().unwrap_or_default().to_string_lossy().to_string();
                    if !profiles.iter().any(|p| p.id.eq_ignore_ascii_case(&stem)) {
                        profiles.push(ProfileDto {
                            id: stem.clone(),
                            name: stem,
                            description: "Custom user profile".into(),
                            is_preset: false,
                            performance_preset: "BALANCED".into(),
                        });
                    }
                }
            }
        }
    }

    Ok(profiles)
}

#[tauri::command]
pub async fn save_custom_profile(name: String, preset: String) -> Result<(), String> {
    let clean_name = sanitize_filename(&name);
    let samrat_dir = get_samrat_data_dir();
    let profiles_dir = samrat_dir.join("profiles");
    let _ = std::fs::create_dir_all(&profiles_dir);

    let profile_file = profiles_dir.join(format!("{}.json", clean_name));
    let content = serde_json::json!({
        "name": clean_name,
        "performancePreset": preset,
        "createdAt": chrono::Utc::now().to_rfc3339()
    });

    std::fs::write(&profile_file, serde_json::to_string_pretty(&content).unwrap())
        .map_err(|e| format!("Failed to save profile: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn delete_custom_profile(name: String) -> Result<(), String> {
    let clean_name = sanitize_filename(&name);
    let samrat_dir = get_samrat_data_dir();
    let profile_file = samrat_dir.join("profiles").join(format!("{}.json", clean_name));
    if profile_file.exists() {
        let _ = std::fs::remove_file(profile_file);
    }
    Ok(())
}

// ─── Online Curated 1.8.9 Mod Catalog & Downloader ───────────────────────────

#[tauri::command]
pub async fn get_curated_mods() -> Result<Vec<CuratedModDto>, String> {
    let samrat_dir = get_samrat_data_dir();
    let mods_dir = samrat_dir.join("game").join("mods");

    let mut catalog = vec![
        CuratedModDto {
            id: "optifine_189".into(),
            name: "OptiFine 1.8.9 HD U M5".into(),
            version: "1.8.9-HD-U-M5".into(),
            author: "sp614x".into(),
            description: "Essential FPS booster with shaderpack support, connected textures, and dynamic lighting.".into(),
            category: "Performance & Graphics".into(),
            download_url: "https://optifine.net/download?f=OptiFine_1.8.9_HD_U_M5.jar".into(),
            filename: "OptiFine_1.8.9_HD_U_M5.jar".into(),
            installed: false,
            size_kb: 2450,
        },
        CuratedModDto {
            id: "old_animations".into(),
            name: "1.7 Old Animations Mod".into(),
            version: "2.4.2".into(),
            author: "SpiderFrog".into(),
            description: "Restores authentic 1.7 block-hitting, bow drawing, and eating motion to 1.8.9.".into(),
            category: "Animation".into(),
            download_url: "https://github.com/GamingOP69/Launcher/releases/download/v1.0.0/OldAnimations-2.4.2-1.8.9.jar".into(),
            filename: "OldAnimations-2.4.2-1.8.9.jar".into(),
            installed: false,
            size_kb: 420,
        },
        CuratedModDto {
            id: "scrollable_tooltips".into(),
            name: "Scrollable Tooltips".into(),
            version: "1.3".into(),
            author: "Sk1er".into(),
            description: "Enables smooth mouse-wheel scrolling on long enchantment tooltips and item lores in shops.".into(),
            category: "HUD & Quality of Life".into(),
            download_url: "https://github.com/GamingOP69/Launcher/releases/download/v1.0.0/ScrollableTooltips-1.3-1.8.9.jar".into(),
            filename: "ScrollableTooltips-1.3-1.8.9.jar".into(),
            installed: false,
            size_kb: 180,
        },
        CuratedModDto {
            id: "autotip".into(),
            name: "AutoTip 1.8.9".into(),
            version: "3.0.1".into(),
            author: "Sk1er & 2Pi".into(),
            description: "Automatically sends tips to network booster holders on Hypixel to earn free experience and coins.".into(),
            category: "Utility".into(),
            download_url: "https://github.com/GamingOP69/Launcher/releases/download/v1.0.0/AutoTip-3.0.1-1.8.9.jar".into(),
            filename: "AutoTip-3.0.1-1.8.9.jar".into(),
            installed: false,
            size_kb: 310,
        },
        CuratedModDto {
            id: "memoryfix".into(),
            name: "MemoryFix 1.8.9".into(),
            version: "1.0.0".into(),
            author: "Prplz".into(),
            description: "Fixes an aggressive memory leak in vanilla 1.8.9 FontRenderer and world texture garbage collections.".into(),
            category: "Performance".into(),
            download_url: "https://github.com/GamingOP69/Launcher/releases/download/v1.0.0/MemoryFix-1.8.9.jar".into(),
            filename: "MemoryFix-1.8.9.jar".into(),
            installed: false,
            size_kb: 45,
        },
    ];

    if mods_dir.exists() {
        for mod_item in &mut catalog {
            let target = mods_dir.join(&mod_item.filename);
            if target.exists() && target.is_file() {
                mod_item.installed = true;
                if let Ok(meta) = std::fs::metadata(&target) {
                    mod_item.size_kb = meta.len() / 1024;
                }
            }
        }
    }

    Ok(catalog)
}

#[tauri::command]
pub async fn download_curated_mod(
    app: AppHandle,
    state: State<'_, AppState>,
    download_url: String,
    filename: String,
) -> Result<String, String> {
    let clean_filename = sanitize_filename(&filename);
    let samrat_dir = get_samrat_data_dir();
    let mods_dir = samrat_dir.join("game").join("mods");
    let _ = std::fs::create_dir_all(&mods_dir);

    let target_path = mods_dir.join(&clean_filename);

    if let Ok(mut logs) = state.logs.lock() {
        logs.push(format!("[MOD_DOWNLOAD] Downloading mod: {} from {}", clean_filename, download_url));
    }

    let _ = app.emit("mod_download_progress", serde_json::json!({
        "filename": clean_filename,
        "percent": 15
    }));

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))?;

    let response = client
        .get(&download_url)
        .send()
        .await
        .map_err(|e| format!("Mod download request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Download server returned HTTP {}", response.status()));
    }

    let bytes = response.bytes().await.map_err(|e| format!("Failed to read mod file data: {}", e))?;

    std::fs::write(&target_path, &bytes).map_err(|e| format!("Failed to save mod file to disk: {}", e))?;

    let _ = app.emit("mod_download_progress", serde_json::json!({
        "filename": clean_filename,
        "percent": 100
    }));

    if let Ok(mut logs) = state.logs.lock() {
        logs.push(format!("[MOD_DOWNLOAD] Mod saved successfully to {}", target_path.display()));
    }

    Ok(target_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn delete_mod_file(filename: String) -> Result<(), String> {
    let clean_filename = sanitize_filename(&filename);
    let samrat_dir = get_samrat_data_dir();
    let target = samrat_dir.join("game").join("mods").join(&clean_filename);
    if target.exists() {
        let _ = std::fs::remove_file(target);
    }
    Ok(())
}

fn num_cpus_fallback() -> usize {
    std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
}
