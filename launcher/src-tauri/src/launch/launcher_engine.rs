use super::args_builder::{ArgsBuilder, LaunchConfig};
use super::minecraft_installer::MinecraftInstaller;
use crate::security::path_guard::get_samrat_data_dir;
use crate::security::sanitizer::sanitize_log;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct LauncherEngine {
    pub running_pid: Arc<Mutex<Option<u32>>>,
    launching: Arc<AtomicBool>,
}

struct LaunchReservation(Arc<AtomicBool>);

impl Drop for LaunchReservation {
    fn drop(&mut self) {
        self.0.store(false, Ordering::Release);
    }
}

impl LauncherEngine {
    pub fn new() -> Self {
        Self {
            running_pid: Arc::new(Mutex::new(None)),
            launching: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Resolve optimal Java executable on the target machine (prefers javaw on Windows to avoid console popup).
    pub fn resolve_java_executable(&self, user_specified: &str) -> String {
        let trimmed = user_specified.trim();

        #[cfg(target_os = "windows")]
        {
            if !trimmed.is_empty() {
                let user_path = PathBuf::from(trimmed);
                if user_path.exists() {
                    if let Some(name) = user_path.file_name().and_then(|n| n.to_str()) {
                        if name.eq_ignore_ascii_case("java.exe") {
                            if let Some(parent) = user_path.parent() {
                                let javaw = parent.join("javaw.exe");
                                if javaw.exists() {
                                    return javaw.to_string_lossy().to_string();
                                }
                            }
                        }
                    }
                    return trimmed.to_string();
                }
            }

            // Check JAVA_HOME
            if let Ok(jh) = std::env::var("JAVA_HOME") {
                let javaw = PathBuf::from(&jh).join("bin").join("javaw.exe");
                if javaw.exists() {
                    return javaw.to_string_lossy().to_string();
                }
                let java = PathBuf::from(&jh).join("bin").join("java.exe");
                if java.exists() {
                    return java.to_string_lossy().to_string();
                }
            }

            // Check common Windows installations
            let roots = [
                r"C:\Program Files\Eclipse Adoptium",
                r"C:\Program Files\Java",
                r"C:\Program Files\Zulu",
                r"C:\Program Files\Microsoft",
                r"C:\Program Files\Amazon Corretto",
            ];

            for root in &roots {
                let p = std::path::Path::new(root);
                if let Ok(entries) = std::fs::read_dir(p) {
                    for entry in entries.flatten() {
                        let javaw = entry.path().join("bin").join("javaw.exe");
                        if javaw.exists() {
                            return javaw.to_string_lossy().to_string();
                        }
                    }
                }
            }

            // Default fallback
            "javaw".to_string()
        }

        #[cfg(not(target_os = "windows"))]
        {
            if !trimmed.is_empty() {
                trimmed.to_string()
            } else {
                "java".to_string()
            }
        }
    }

    pub async fn launch_async(&self, config: LaunchConfig) -> Result<u32, String> {
        // Reserve before any await so concurrent UI requests cannot both install
        // and spawn a game process before running_pid is populated.
        if self
            .launching
            .compare_exchange(false, true, Ordering::Acquire, Ordering::Relaxed)
            .is_err()
        {
            return Err("A game launch is already being prepared.".to_string());
        }
        let reservation = LaunchReservation(self.launching.clone());

        // Check for an existing instance, then release the mutex before awaits.
        {
            let running = self.running_pid.lock().map_err(|e| e.to_string())?;
            if running.is_some() {
                return Err("A game instance is already running.".to_string());
            }
        } // MutexGuard released here

        let java_exe = self.resolve_java_executable(&config.java_path);
        let samrat_dir = get_samrat_data_dir();
        let game_dir = samrat_dir.join("game");
        let assets_dir = samrat_dir.join("assets");
        std::fs::create_dir_all(&game_dir)
            .map_err(|e| format!("Could not create game directory {}: {e}", game_dir.display()))?;
        std::fs::create_dir_all(&assets_dir)
            .map_err(|e| format!("Could not create assets directory {}: {e}", assets_dir.display()))?;

        let mut launch_config = config.clone();
        launch_config.game_dir = game_dir.to_string_lossy().to_string();
        launch_config.assets_dir = assets_dir.to_string_lossy().to_string();

        // Attempt to ensure vanilla Minecraft 1.8.9 assets & libraries are ready.
        // Guard is NOT held here — safe to await.
        let (full_classpath, natives_path, main_class) = match MinecraftInstaller::ensure_minecraft_189_installed(None, &samrat_dir).await {
            Ok(installed) => {
                launch_config.asset_index = installed.asset_index;
                (installed.classpath, Some(installed.natives_dir), "net.minecraft.client.main.Main".to_string())
            }
            Err(e) => {
                return Err(format!("Minecraft 1.8.9 runtime preparation failed; no preview or Swing fallback will be started: {}", e));
            }
        };

        let args = ArgsBuilder::build_jvm_args(&launch_config, &full_classpath, natives_path.as_deref(), &main_class);
        log::info!(
            "Launching Samrat Minecraft 1.8.9: java='{}', mainClass='{}', user='{}'",
            java_exe,
            main_class,
            config.username
        );

        let mut cmd = Command::new(&java_exe);
        cmd.args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        }

        let mut child = cmd.spawn().map_err(|e| {
            format!(
                "Failed to spawn Java runtime ('{}'): {}.\nPlease ensure Java 8, 17, or 21 is installed.",
                java_exe, e
            )
        })?;

        let pid = child.id();
        // Re-acquire the lock now that all async work is done.
        let mut running = self.running_pid.lock().map_err(|e| e.to_string())?;
        *running = Some(pid);
        drop(running);
        drop(reservation);

        // Pipe stdout in background thread
        if let Some(stdout) = child.stdout.take() {
            std::thread::spawn(move || {
                for line in BufReader::new(stdout).lines().map_while(Result::ok) {
                    let clean = sanitize_log(&line);
                    log::info!("[GAME_STDOUT] {}", clean);
                }
            });
        }

        // Pipe stderr in background thread
        if let Some(stderr) = child.stderr.take() {
            std::thread::spawn(move || {
                for line in BufReader::new(stderr).lines().map_while(Result::ok) {
                    let clean = sanitize_log(&line);
                    log::warn!("[GAME_STDERR] {}", clean);
                }
            });
        }

        // Monitor process lifecycle
        let pid_holder = self.running_pid.clone();
        std::thread::spawn(move || {
            let status = child.wait();
            log::info!("Game process (PID {}) finished: {:?}", pid, status);
            if let Ok(mut holder) = pid_holder.lock() {
                *holder = None;
            }
        });

        Ok(pid)
    }

    pub fn is_running(&self) -> bool {
        self.running_pid
            .lock()
            .map(|g| g.is_some())
            .unwrap_or(false)
    }

    pub fn terminate(&self) -> Result<(), String> {
        let mut running = self.running_pid.lock().map_err(|e| e.to_string())?;
        if let Some(pid) = *running {
            #[cfg(target_os = "windows")]
            {
                let _ = Command::new("taskkill")
                    .args(["/PID", &pid.to_string(), "/F"])
                    .output();
            }
            #[cfg(not(target_os = "windows"))]
            {
                let _ = Command::new("kill").args(["-9", &pid.to_string()]).output();
            }
            *running = None;
            Ok(())
        } else {
            Err("No running game process found.".to_string())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn launch_reservation_excludes_concurrent_attempts_and_releases_on_drop() {
        let flag = Arc::new(AtomicBool::new(false));
        assert!(flag
            .compare_exchange(false, true, Ordering::Acquire, Ordering::Relaxed)
            .is_ok());
        let reservation = LaunchReservation(flag.clone());
        assert!(flag
            .compare_exchange(false, true, Ordering::Acquire, Ordering::Relaxed)
            .is_err());

        drop(reservation);

        assert!(!flag.load(Ordering::Acquire));
        assert!(flag
            .compare_exchange(false, true, Ordering::Acquire, Ordering::Relaxed)
            .is_ok());
    }
}
