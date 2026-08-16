use super::args_builder::{ArgsBuilder, LaunchConfig};
use crate::security::sanitizer::sanitize_log;
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

        let args = ArgsBuilder::build_jvm_args(&config);
        log::info!("Launching Samrat Client with Java: {}", java_exe);

        let mut child = Command::new(&java_exe)
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn Java process ({}): {}", java_exe, e))?;

        let pid = child.id();
        *running = Some(pid);

        // Spawn async background monitor for child process
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
