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

    pub fn resolve_client_jar(&self, specified_path: &str) -> Result<PathBuf, String> {
        let samrat_dir = get_samrat_data_dir();
        
        // 1. Direct path check
        let p = PathBuf::from(specified_path);
        if p.exists() && p.is_file() {
            return Ok(p);
        }

        // 2. Candidate relative locations
        let candidates = [
            PathBuf::from(specified_path),
            PathBuf::from("client/build/libs/samrat-client-1.8.9-1.0.0.jar"),
            PathBuf::from("client/build/libs/samrat-client-1.8.9.jar"),
            PathBuf::from("../client/build/libs/samrat-client-1.8.9-1.0.0.jar"),
            PathBuf::from("../../client/build/libs/samrat-client-1.8.9-1.0.0.jar"),
            samrat_dir.join("versions/1.8.9/samrat-client-1.8.9.jar"),
            samrat_dir.join("game/samrat-client-1.8.9.jar"),
        ];

        for cand in &candidates {
            if cand.exists() && cand.is_file() {
                return Ok(cand.clone());
            }
        }

        // 3. Search directory for any .jar in client/build/libs
        let lib_dirs = [
            PathBuf::from("client/build/libs"),
            PathBuf::from("../client/build/libs"),
            PathBuf::from("../../client/build/libs"),
            samrat_dir.join("versions/1.8.9"),
        ];

        for lib_dir in &lib_dirs {
            if lib_dir.exists() {
                if let Ok(entries) = std::fs::read_dir(lib_dir) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.extension().and_then(|s| s.to_str()) == Some("jar") {
                            return Ok(path);
                        }
                    }
                }
            }
        }

        // If not found, return the specified path or fallback
        Ok(PathBuf::from("client/build/libs/samrat-client-1.8.9-1.0.0.jar"))
    }

    pub fn launch(&self, config: LaunchConfig) -> Result<u32, String> {
        let mut running = self.running_pid.lock().map_err(|e| e.to_string())?;
        if running.is_some() {
            return Err("A game instance is already running.".to_string());
        }

        let java_exe = if config.java_path.trim().is_empty() {
            "java".to_string()
        } else {
            config.java_path.clone()
        };

        let resolved_jar = self.resolve_client_jar(&config.client_jar_path)?;
        let classpath_str = resolved_jar.to_string_lossy().to_string();

        let args = ArgsBuilder::build_jvm_args(&config, &classpath_str);
        log::info!("Launching Samrat Client with Java: {} | Classpath: {}", java_exe, classpath_str);

        // Ensure game directories exist
        let _ = std::fs::create_dir_all(&config.game_dir);
        let _ = std::fs::create_dir_all(&config.assets_dir);

        let mut child = Command::new(&java_exe)
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn Java process ({}): {}. Ensure Java 8/17/21 is installed.", java_exe, e))?;

        let pid = child.id();
        *running = Some(pid);

        // Pipe stdout and sanitize logs in real time
        if let Some(stdout) = child.stdout.take() {
            std::thread::spawn(move || {
                let reader = BufReader::new(stdout);
                for line in reader.lines().map_while(Result::ok) {
                    let clean = sanitize_log(&line);
                    log::info!("[GAME_STDOUT] {}", clean);
                }
            });
        }

        // Pipe stderr and sanitize logs in real time
        if let Some(stderr) = child.stderr.take() {
            std::thread::spawn(move || {
                let reader = BufReader::new(stderr);
                for line in reader.lines().map_while(Result::ok) {
                    let clean = sanitize_log(&line);
                    log::warn!("[GAME_STDERR] {}", clean);
                }
            });
        }

        // Spawn async background monitor for process termination
        let pid_holder = self.running_pid.clone();
        std::thread::spawn(move || {
            let status = child.wait();
            log::info!("Game process (PID {}) terminated with status: {:?}", pid, status);
            if let Ok(mut holder) = pid_holder.lock() {
                *holder = None;
            }
        });

        Ok(pid)
    }

    pub fn is_running(&self) -> bool {
        self.running_pid.lock().map(|g| g.is_some()).unwrap_or(false)
    }

    pub fn terminate(&self) -> Result<(), String> {
        let mut running = self.running_pid.lock().map_err(|e| e.to_string())?;
        if let Some(pid) = *running {
            #[cfg(target_os = "windows")]
            {
                let _ = Command::new("taskkill").args(["/PID", &pid.to_string(), "/F"]).output();
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
