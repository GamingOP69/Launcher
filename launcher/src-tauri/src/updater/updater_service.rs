use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::Read;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateArtifact {
    pub url: String,
    pub sha256: String,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateManifest {
    pub version: String,
    pub release_date: String,
    pub channel: String,
    pub changelog: Vec<String>,
    pub client_jar: Option<UpdateArtifact>,
    pub launcher_installer: Option<UpdateArtifact>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCheckResult {
    pub update_available: bool,
    pub current_version: String,
    pub latest_version: String,
    pub changelog: Vec<String>,
    pub manifest: Option<UpdateManifest>,
}

pub struct UpdaterService;

impl UpdaterService {
    pub async fn check_for_updates(current_version: &str, channel: &str) -> Result<UpdateCheckResult, String> {
        if !matches!(channel, "stable" | "preview") {
            return Err("Unsupported update channel.".to_string());
        }
        let _ = current_version;
        Err("Update checks are unavailable until a signed manifest, trusted public key, and package version source are configured.".to_string())
    }

    pub fn verify_file_sha256<P: AsRef<Path>>(file_path: P, expected_hex: &str) -> Result<bool, String> {
        let mut file = File::open(file_path).map_err(|e| format!("Failed to open file: {}", e))?;
        let mut hasher = Sha256::new();
        let mut buffer = [0u8; 8192];

        loop {
            let bytes_read = file.read(&mut buffer).map_err(|e| format!("Read error: {}", e))?;
            if bytes_read == 0 {
                break;
            }
            hasher.update(&buffer[..bytes_read]);
        }

        let computed_hex = hex::encode(hasher.finalize());
        Ok(computed_hex.eq_ignore_ascii_case(expected_hex))
    }
}

pub fn is_newer_version(current: &str, latest: &str) -> bool {
    let parse_semver = |v: &str| -> Vec<u32> {
        v.trim_start_matches('v')
            .split('.')
            .filter_map(|part| part.parse::<u32>().ok())
            .collect()
    };

    let curr_parts = parse_semver(current);
    let late_parts = parse_semver(latest);

    for (c, l) in curr_parts.iter().zip(late_parts.iter()) {
        if l > c {
            return true;
        } else if l < c {
            return false;
        }
    }

    late_parts.len() > curr_parts.len()
}
