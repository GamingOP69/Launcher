use serde::{Deserialize, Serialize};
use crate::security::atomic_file::write_atomically;
use std::path::{Path, PathBuf};

const SETTINGS_FILE: &str = "launcher-settings.json";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct LauncherSettings {
    #[serde(default = "schema_version")]
    pub schema_version: u32,
    #[serde(default = "default_profile")]
    pub selected_profile_id: String,
    #[serde(default = "default_ram")]
    pub allocated_ram_mb: u32,
    #[serde(default)]
    pub java_path: String,
    #[serde(default)]
    pub custom_jvm_args: String,
    #[serde(default = "default_true")]
    pub close_launcher_on_game_start: bool,
    #[serde(default = "default_true")]
    pub enable_hardware_acceleration: bool,
    #[serde(default = "default_true")]
    pub auto_check_updates: bool,
    #[serde(default = "default_channel")]
    pub release_channel: String,
    #[serde(default = "default_width")]
    pub game_resolution_width: u32,
    #[serde(default = "default_height")]
    pub game_resolution_height: u32,
}

fn schema_version() -> u32 { 1 }
fn default_profile() -> String { "Default".to_string() }
fn default_ram() -> u32 { 3072 }
fn default_true() -> bool { true }
fn default_channel() -> String { "stable".to_string() }
fn default_width() -> u32 { 1920 }
fn default_height() -> u32 { 1080 }

impl Default for LauncherSettings {
    fn default() -> Self {
        Self {
            schema_version: schema_version(),
            selected_profile_id: default_profile(),
            allocated_ram_mb: default_ram(),
            java_path: String::new(),
            custom_jvm_args: String::new(),
            close_launcher_on_game_start: true,
            enable_hardware_acceleration: true,
            auto_check_updates: true,
            release_channel: default_channel(),
            game_resolution_width: default_width(),
            game_resolution_height: default_height(),
        }
    }
}

impl LauncherSettings {
    fn normalized(mut self) -> Result<Self, String> {
        if self.schema_version != 1 {
            return Err("Unsupported launcher settings version.".to_string());
        }
        self.allocated_ram_mb = self.allocated_ram_mb.clamp(512, 16_384);
        self.game_resolution_width = self.game_resolution_width.clamp(640, 7_680);
        self.game_resolution_height = self.game_resolution_height.clamp(480, 4_320);
        if !matches!(self.release_channel.as_str(), "stable" | "beta" | "nightly") {
            self.release_channel = "stable".to_string();
        }
        self.selected_profile_id = self.selected_profile_id.chars().take(64).collect();
        self.java_path = self.java_path.chars().take(2_048).collect();
        self.custom_jvm_args = self.custom_jvm_args.chars().take(2_048).collect();
        Ok(self)
    }
}

fn settings_path(data_dir: &Path) -> PathBuf {
    data_dir.join(SETTINGS_FILE)
}

fn load_from(path: &Path) -> Result<LauncherSettings, String> {
    match std::fs::read(path) {
        Ok(bytes) => serde_json::from_slice::<LauncherSettings>(&bytes)
            .map_err(|error| format!("Launcher settings file is invalid: {error}"))?
            .normalized(),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(LauncherSettings::default()),
        Err(error) => Err(format!("Could not read launcher settings: {error}")),
    }
}

fn save_to(path: &Path, settings: LauncherSettings) -> Result<LauncherSettings, String> {
    let settings = settings.normalized()?;
    let bytes = serde_json::to_vec_pretty(&settings)
        .map_err(|error| format!("Could not serialize launcher settings: {error}"))?;
    write_atomically(path, &bytes)
        .map_err(|error| format!("Could not atomically replace launcher settings: {error}"))?;
    Ok(settings)
}

#[tauri::command]
pub async fn get_launcher_settings() -> Result<LauncherSettings, String> {
    load_from(&settings_path(&crate::security::path_guard::get_samrat_data_dir()))
}

#[tauri::command]
pub async fn save_launcher_settings(settings: LauncherSettings) -> Result<LauncherSettings, String> {
    save_to(&settings_path(&crate::security::path_guard::get_samrat_data_dir()), settings)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_path(label: &str) -> PathBuf {
        std::env::temp_dir().join(format!("samrat-settings-{label}-{}-{}.json", std::process::id(),
            std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_nanos()))
    }

    #[test]
    fn missing_settings_returns_defaults_without_creating_files() {
        let path = test_path("missing");
        assert_eq!(load_from(&path).unwrap(), LauncherSettings::default());
        assert!(!path.exists());
    }

    #[test]
    fn settings_round_trip_and_clamp_launch_values() {
        let path = test_path("round-trip");
        let settings = LauncherSettings { allocated_ram_mb: u32::MAX, game_resolution_width: 1,
            game_resolution_height: u32::MAX, release_channel: "unknown".into(), ..Default::default() };
        let saved = save_to(&path, settings).unwrap();
        assert_eq!(saved.allocated_ram_mb, 16_384);
        assert_eq!(saved.game_resolution_width, 640);
        assert_eq!(saved.game_resolution_height, 4_320);
        assert_eq!(saved.release_channel, "stable");
        assert_eq!(load_from(&path).unwrap(), saved);

        let updated = LauncherSettings { java_path: "C:\\Java\\bin\\javaw.exe".into(), ..saved.clone() };
        save_to(&path, updated.clone()).unwrap();
        assert_eq!(load_from(&path).unwrap(), updated);
        std::fs::remove_file(path).unwrap();
    }

    #[test]
    fn invalid_or_unsupported_settings_do_not_silently_reset() {
        let path = test_path("invalid");
        std::fs::write(&path, b"{").unwrap();
        assert!(load_from(&path).is_err());
        let unsupported = LauncherSettings { schema_version: 2, ..Default::default() };
        assert!(save_to(&path, unsupported).is_err());
        std::fs::remove_file(path).unwrap();
    }
}
