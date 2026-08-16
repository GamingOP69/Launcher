use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JavaRuntimeInfo {
    pub path: String,
    pub version: String,
    pub is_64_bit: bool,
    pub vendor: String,
    pub is_recommended: bool,
}

pub fn detect_java_installations() -> Vec<JavaRuntimeInfo> {
    let mut runtimes = Vec::new();
    let mut checked_paths = std::collections::HashSet::new();

    // 1. Check JAVA_HOME
    if let Ok(java_home) = std::env::var("JAVA_HOME") {
        let bin = PathBuf::from(java_home).join("bin").join(exe_name("java"));
        if bin.exists() {
            checked_paths.insert(bin.clone());
            if let Some(info) = inspect_java(&bin) {
                runtimes.push(info);
            }
        }
    }

    // 2. Check PATH java
    if let Ok(output) = Command::new("where").arg("java").output() {
        if output.status.success() {
            let str_out = String::from_utf8_lossy(&output.stdout);
            for line in str_out.lines() {
                let p = PathBuf::from(line.trim());
                if p.exists() && !checked_paths.contains(&p) {
                    checked_paths.insert(p.clone());
                    if let Some(info) = inspect_java(&p) {
                        runtimes.push(info);
                    }
                }
            }
        }
    }

    // 3. Scan Standard Program Files Directories on Windows
    #[cfg(target_os = "windows")]
    {
        let roots = [
            r"C:\Program Files\Java",
            r"C:\Program Files\Eclipse Adoptium",
            r"C:\Program Files\Zulu",
            r"C:\Program Files\Microsoft",
            r"C:\Program Files\Amazon Corretto",
        ];

        for root in roots {
            let root_path = Path::new(root);
            if root_path.exists() {
                if let Ok(entries) = std::fs::read_dir(root_path) {
                    for entry in entries.flatten() {
                        let bin = entry.path().join("bin").join("java.exe");
                        if bin.exists() && !checked_paths.contains(&bin) {
                            checked_paths.insert(bin.clone());
                            if let Some(info) = inspect_java(&bin) {
                                runtimes.push(info);
                            }
                        }
                    }
                }
            }
        }
    }

    runtimes
}

pub fn inspect_java(java_path: &Path) -> Option<JavaRuntimeInfo> {
    let output = Command::new(java_path).arg("-version").output().ok()?;
    let stderr = String::from_utf8_lossy(&output.stderr);
    let stdout = String::from_utf8_lossy(&output.stdout);
    let combined = format!("{}\n{}", stderr, stdout);

    let is_64_bit = combined.contains("64-Bit") || combined.contains("x86_64") || combined.contains("amd64");
    
    let mut version = "Unknown".to_string();
    let mut vendor = "Oracle / OpenJDK".to_string();

    if let Some(first_line) = combined.lines().next() {
        if let Some(start) = first_line.find('"') {
            if let Some(end) = first_line[start + 1..].find('"') {
                version = first_line[start + 1..start + 1 + end].to_string();
            }
        }
    }

    if combined.contains("Temurin") {
        vendor = "Adoptium Temurin".to_string();
    } else if combined.contains("Zulu") {
        vendor = "Azul Zulu".to_string();
    } else if combined.contains("Corretto") {
        vendor = "Amazon Corretto".to_string();
    } else if combined.contains("Microsoft") {
        vendor = "Microsoft OpenJDK".to_string();
    }

    let is_recommended = is_64_bit && (version.starts_with("1.8") || version.starts_with("8.") || version.starts_with("17."));

    Some(JavaRuntimeInfo {
        path: java_path.to_string_lossy().to_string(),
        version,
        is_64_bit,
        vendor,
        is_recommended,
    })
}

fn exe_name(name: &str) -> String {
    #[cfg(target_os = "windows")]
    {
        format!("{}.exe", name)
    }
    #[cfg(not(target_os = "windows"))]
    {
        name.to_string()
    }
}
