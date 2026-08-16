use super::args_builder::{ArgsBuilder, LaunchConfig};
use crate::security::path_guard::get_samrat_data_dir;
use crate::security::sanitizer::sanitize_log;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct LauncherEngine {
    pub running_pid: Arc<Mutex<Option<u32>>>,
}

impl LauncherEngine {
    pub fn new() -> Self {
        Self {
            running_pid: Arc::new(Mutex::new(None)),
        }
    }

    /// Resolve the client JAR across all possible local directories.
    pub fn resolve_client_jar(&self, specified_path: &str) -> Result<PathBuf, String> {
        let samrat_dir = get_samrat_data_dir();

        // 1. Check specified path if non-empty
        if !specified_path.trim().is_empty() {
            let p = PathBuf::from(specified_path);
            if p.exists() && p.is_file() {
                return Ok(p);
            }
        }

        // 2. Candidate locations (Primary .samrat data directory, repo build libs, exe folder)
        let candidates = [
            samrat_dir.join("client").join("samrat-client-1.8.9.jar"),
            samrat_dir.join("client").join("samrat-client-1.8.9-1.0.0.jar"),
            samrat_dir.join("versions").join("1.8.9").join("samrat-client-1.8.9.jar"),
            samrat_dir.join("game").join("samrat-client-1.8.9.jar"),
            PathBuf::from("client/build/libs/samrat-client-1.8.9.jar"),
            PathBuf::from("client/build/libs/samrat-client-1.8.9-1.0.0.jar"),
            PathBuf::from("../client/build/libs/samrat-client-1.8.9.jar"),
            PathBuf::from("../client/build/libs/samrat-client-1.8.9-1.0.0.jar"),
            PathBuf::from("../../client/build/libs/samrat-client-1.8.9.jar"),
            PathBuf::from("../../client/build/libs/samrat-client-1.8.9-1.0.0.jar"),
        ];

        for cand in &candidates {
            if cand.exists() && cand.is_file() {
                return Ok(cand.clone());
            }
        }

        // 3. Scan directory if there is any .jar in client/build/libs or .samrat/client
        let scan_dirs = [
            samrat_dir.join("client"),
            samrat_dir.join("versions/1.8.9"),
            PathBuf::from("client/build/libs"),
            PathBuf::from("../client/build/libs"),
        ];

        for dir in &scan_dirs {
            if dir.exists() {
                if let Ok(entries) = std::fs::read_dir(dir) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("jar") {
                            let name = path.file_name().unwrap_or_default().to_string_lossy();
                            if name.starts_with("samrat-client") && !name.contains("sources") && !name.contains("javadoc") {
                                return Ok(path);
                            }
                        }
                    }
                }
            }
        }

        Err("Samrat Client JAR was not found on your system. Please click 'Install Client' on the home screen to download.".to_string())
    }

    /// Resolve optimal Java executable on the target machine (prefers javaw on Windows to avoid console popup).
    pub fn resolve_java_executable(&self, user_specified: &str) -> String {
        let trimmed = user_specified.trim();

        #[cfg(target_os = "windows")]
        {
            if !trimmed.is_empty() {
                let user_path = PathBuf::from(trimmed);
                if user_path.exists() {
                    // If points to java.exe, check if javaw.exe exists adjacent
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
                if p.exists() {
                    if let Ok(entries) = std::fs::read_dir(p) {
                        for entry in entries.flatten() {
                            let javaw = entry.path().join("bin").join("javaw.exe");
                            if javaw.exists() {
                                return javaw.to_string_lossy().to_string();
                            }
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

    pub fn launch(&self, config: LaunchConfig) -> Result<u32, String> {
        let mut running = self.running_pid.lock().map_err(|e| e.to_string())?;
        if running.is_some() {
            return Err("A game instance is already running.".to_string());
        }

        let java_exe = self.resolve_java_executable(&config.java_path);
        let resolved_jar = self.resolve_client_jar(&config.client_jar_path)?;
        let classpath_str = resolved_jar.to_string_lossy().to_string();

        let samrat_dir = get_samrat_data_dir();
        let game_dir = samrat_dir.join("game");
        let assets_dir = samrat_dir.join("assets");
        let _ = std::fs::create_dir_all(&game_dir);
        let _ = std::fs::create_dir_all(&assets_dir);

        let mut launch_config = config.clone();
        launch_config.game_dir = game_dir.to_string_lossy().to_string();
        launch_config.assets_dir = assets_dir.to_string_lossy().to_string();

        let args = ArgsBuilder::build_jvm_args(&launch_config, &classpath_str);
        log::info!(
            "Launching Samrat Client: executable='{}', jar='{}', user='{}'",
            java_exe,
            classpath_str,
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
        *running = Some(pid);

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
