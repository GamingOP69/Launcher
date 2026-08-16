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
        let manifest_url = format!(
            "https://raw.githubusercontent.com/samrat-client/launcher/main/dist/update-manifest-{}.json",
            channel
        );

        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(8))
            .build()
            .map_err(|e| e.to_string())?;

        let resp = client.get(&manifest_url).send().await;

        match resp {
            Ok(res) if res.status().is_success() => {
                if let Ok(manifest) = res.json::<UpdateManifest>().await {
                    let update_available = is_newer_version(current_version, &manifest.version);
                    return Ok(UpdateCheckResult {
                        update_available,
                        current_version: current_version.to_string(),
                        latest_version: manifest.version.clone(),
                        changelog: manifest.changelog.clone(),
                        manifest: Some(manifest),
                    });
                }
            }
            _ => {}
        }

        // Return up-to-date baseline if network check fails or latest version matches
        Ok(UpdateCheckResult {
            update_available: false,
            current_version: current_version.to_string(),
            latest_version: current_version.to_string(),
            changelog: vec![
                "Initial Samrat Client v1.0.0 Release".to_string(),
                "Performance Engine & Bedwars Suite".to_string(),
            ],
            manifest: None,
        })
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
