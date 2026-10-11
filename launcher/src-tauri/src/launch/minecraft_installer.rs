use serde::Deserialize;
use sha1::{Digest, Sha1};
use std::collections::HashMap;
use std::io::{Cursor, Read, Write};
use std::path::{Component, Path, PathBuf};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::sync::Semaphore;
use tokio::task::JoinSet;

const VERSION_MANIFEST_URL: &str =
    "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
const USER_AGENT: &str = "SamratLauncher/1.0.0";
const MAX_METADATA_BYTES: usize = 16 * 1024 * 1024;
const MAX_ARTIFACT_BYTES: u64 = 256 * 1024 * 1024;
const MAX_TOTAL_ASSET_BYTES: u64 = 2 * 1024 * 1024 * 1024;
const MAX_ASSET_COUNT: usize = 20_000;
const MAX_NATIVE_EXPANSION: u64 = 256 * 1024 * 1024;

const METADATA_HOSTS: &[&str] = &[
    "piston-meta.mojang.com",
    "launchermeta.mojang.com",
    "piston-data.mojang.com",
];
const ARTIFACT_HOSTS: &[&str] = &[
    "piston-meta.mojang.com",
    "launchermeta.mojang.com",
    "piston-data.mojang.com",
    "libraries.minecraft.net",
    "repo.maven.apache.org",
    "repo1.maven.org",
];
const ASSET_HOSTS: &[&str] = &["resources.download.minecraft.net"];

#[derive(Debug, Clone)]
pub struct InstalledMinecraft {
    pub classpath: String,
    pub natives_dir: String,
    pub asset_index: String,
    pub client_jar: PathBuf,
}

#[derive(Debug, Deserialize)]
struct VersionManifest {
    versions: Vec<VersionEntry>,
}

#[derive(Debug, Deserialize)]
struct VersionEntry {
    id: String,
    url: String,
    sha1: String,
}

#[derive(Debug, Deserialize)]
struct VersionMetadata {
    downloads: VersionDownloads,
    #[serde(rename = "assetIndex")]
    asset_index: AssetIndex,
    #[serde(default)]
    libraries: Vec<Library>,
}

#[derive(Debug, Deserialize)]
struct VersionDownloads {
    client: DownloadArtifact,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AssetIndex {
    id: String,
    url: String,
    sha1: String,
}

#[derive(Debug, Clone, Deserialize)]
struct DownloadArtifact {
    url: String,
    sha1: String,
    size: u64,
    #[serde(default)]
    path: Option<String>,
}

#[derive(Debug, Deserialize)]
struct Library {
    name: String,
    #[serde(default)]
    downloads: Option<LibraryDownloads>,
    #[serde(default)]
    rules: Option<Vec<Rule>>,
    #[serde(default)]
    natives: HashMap<String, String>,
}

#[derive(Debug, Deserialize)]
struct LibraryDownloads {
    #[serde(default)]
    artifact: Option<DownloadArtifact>,
    #[serde(default)]
    classifiers: HashMap<String, DownloadArtifact>,
}

#[derive(Debug, Deserialize)]
struct Rule {
    action: String,
    #[serde(default)]
    os: Option<OsRule>,
}

#[derive(Debug, Deserialize)]
struct OsRule {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    arch: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AssetIndexContents {
    objects: HashMap<String, AssetObject>,
}

#[derive(Debug, Deserialize)]
struct AssetObject {
    hash: String,
    size: u64,
}

pub struct MinecraftInstaller;

impl MinecraftInstaller {
    pub async fn ensure_minecraft_189_installed(
        app: Option<&AppHandle>,
        samrat_dir: &Path,
    ) -> Result<InstalledMinecraft, String> {
        let client = reqwest::Client::builder()
            .user_agent(USER_AGENT)
            .timeout(std::time::Duration::from_secs(60))
            .build()
            .map_err(|e| format!("HTTP client error: {e}"))?;

        let manifest_bytes = fetch_bytes(&client, VERSION_MANIFEST_URL, METADATA_HOSTS, MAX_METADATA_BYTES).await?;
        let manifest: VersionManifest = serde_json::from_slice(&manifest_bytes)
            .map_err(|e| format!("Invalid Mojang version manifest: {e}"))?;
        let version = manifest
            .versions
            .into_iter()
            .find(|version| version.id == "1.8.9")
            .ok_or_else(|| "Mojang's version manifest did not contain Minecraft 1.8.9.".to_string())?;
        validate_sha1(&version.sha1)?;

        let metadata_bytes = fetch_verified_bytes(
            &client,
            &version.url,
            METADATA_HOSTS,
            &version.sha1,
            None,
            MAX_METADATA_BYTES as u64,
        )
        .await?;
        let metadata: VersionMetadata = serde_json::from_slice(&metadata_bytes)
            .map_err(|e| format!("Invalid Minecraft 1.8.9 version metadata: {e}"))?;

        let versions_dir = samrat_dir.join("versions").join("1.8.9");
        let libraries_dir = samrat_dir.join("libraries");
        let assets_dir = samrat_dir.join("assets");
        let natives_dir = samrat_dir.join("natives").join("1.8.9");
        for dir in [&versions_dir, &libraries_dir, &assets_dir, &natives_dir] {
            std::fs::create_dir_all(dir).map_err(|e| format!("Could not create {}: {e}", dir.display()))?;
        }

        emit_progress(app, "Downloading Minecraft 1.8.9 client", 5);
        let client_jar = versions_dir.join("1.8.9.jar");
        download_artifact(&client, &metadata.downloads.client, &client_jar, ARTIFACT_HOSTS).await?;

        let mut classpath_entries = vec![client_jar.clone()];
        let mut native_archives = Vec::new();
        let total_libraries = metadata.libraries.len().max(1);
        for (position, library) in metadata.libraries.iter().enumerate() {
            if !rules_allow_windows(library.rules.as_deref()) {
                continue;
            }
            let Some(downloads) = library.downloads.as_ref() else {
                return Err(format!("Library metadata is missing download records: {}", library.name));
            };
            if let Some(artifact) = downloads.artifact.as_ref() {
                let relative = artifact
                    .path
                    .as_deref()
                    .ok_or_else(|| format!("Library artifact has no relative path: {}", library.name))?;
                let relative = safe_relative_path(relative)?;
                let target = libraries_dir.join(relative);
                download_artifact(&client, artifact, &target, ARTIFACT_HOSTS).await?;
                classpath_entries.push(target);
            }

            if let Some(classifier) = library.natives.get("windows") {
                let classifier = classifier.replace("${arch}", "64");
                if let Some(artifact) = downloads.classifiers.get(&classifier) {
                    let relative = artifact
                        .path
                        .as_deref()
                        .ok_or_else(|| format!("Native artifact has no relative path: {}", library.name))?;
                    let relative = safe_relative_path(relative)?;
                    let target = libraries_dir.join(relative);
                    download_artifact(&client, artifact, &target, ARTIFACT_HOSTS).await?;
                    native_archives.push(target);
                }
            }

            if position % 8 == 0 {
                let percent = 10 + ((position * 45) / total_libraries) as u8;
                emit_progress(app, "Downloading Minecraft libraries", percent);
            }
        }

        std::fs::create_dir_all(&natives_dir).map_err(|e| format!("Could not prepare native directory: {e}"))?;
        for archive_path in native_archives {
            extract_windows_natives(&archive_path, &natives_dir)?;
        }

        emit_progress(app, "Downloading Minecraft assets", 60);
        validate_sha1(&metadata.asset_index.sha1)?;
        let asset_index_bytes = fetch_verified_bytes(
            &client,
            &metadata.asset_index.url,
            METADATA_HOSTS,
            &metadata.asset_index.sha1,
            None,
            MAX_METADATA_BYTES as u64,
        )
        .await?;
        let asset_index: AssetIndexContents = serde_json::from_slice(&asset_index_bytes)
            .map_err(|e| format!("Invalid Minecraft asset index: {e}"))?;
        if asset_index.objects.len() > MAX_ASSET_COUNT {
            return Err("Mojang asset index exceeds the supported object count.".to_string());
        }
        let expected_total = asset_index.objects.values().try_fold(0u64, |total, object| {
            total.checked_add(object.size)
        }).ok_or_else(|| "Mojang asset index size overflowed.".to_string())?;
        if expected_total > MAX_TOTAL_ASSET_BYTES {
            return Err("Mojang asset index exceeds the supported total download size.".to_string());
        }

        let index_path = assets_dir.join("indexes").join(format!("{}.json", metadata.asset_index.id));
        write_verified_bytes(&index_path, &asset_index_bytes, &metadata.asset_index.sha1, None)?;

        let semaphore = Arc::new(Semaphore::new(8));
        let mut downloads = JoinSet::new();
        for object in asset_index.objects.into_values() {
            validate_sha1(&object.hash)?;
            if object.size > MAX_ARTIFACT_BYTES {
                return Err("Mojang asset exceeded the supported individual size.".to_string());
            }
            let hash = object.hash.to_ascii_lowercase();
            let target = assets_dir.join("objects").join(&hash[..2]).join(&hash);
            let url = format!("https://resources.download.minecraft.net/{}/{}", &hash[..2], hash);
            let client = client.clone();
            let semaphore = semaphore.clone();
            let expected_size = object.size;
            downloads.spawn(async move {
                let _permit = semaphore
                    .acquire_owned()
                    .await
                    .map_err(|e| format!("Asset download queue failed: {e}"))?;
                download_verified(&client, &url, &target, &hash, Some(expected_size), ASSET_HOSTS).await
            });
        }
        while let Some(result) = downloads.join_next().await {
            result
                .map_err(|e| format!("Asset download worker failed: {e}"))??;
        }

        emit_progress(app, "Minecraft 1.8.9 is installed", 100);
        #[cfg(target_os = "windows")]
        let separator = ";";
        #[cfg(not(target_os = "windows"))]
        let separator = ":";
        let classpath = classpath_entries
            .iter()
            .map(|path| path.to_string_lossy().to_string())
            .collect::<Vec<_>>()
            .join(separator);

        Ok(InstalledMinecraft {
            classpath,
            natives_dir: natives_dir.to_string_lossy().to_string(),
            asset_index: metadata.asset_index.id,
            client_jar,
        })
    }
}

fn emit_progress(app: Option<&AppHandle>, stage: &str, percent: u8) {
    if let Some(app) = app {
        let _ = app.emit(
            "install_progress",
            serde_json::json!({"stage": stage, "percent": percent}),
        );
    }
}

async fn fetch_bytes(
    client: &reqwest::Client,
    url: &str,
    allowed_hosts: &[&str],
    max_bytes: usize,
) -> Result<Vec<u8>, String> {
    validate_url(url, allowed_hosts)?;
    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Download failed: {e}"))?
        .error_for_status()
        .map_err(|e| format!("Download returned an unsuccessful status: {e}"))?;
    validate_url(response.url().as_str(), allowed_hosts)?;
    if response.content_length().is_some_and(|length| length > max_bytes as u64) {
        return Err("Download exceeded the configured size limit.".to_string());
    }
    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Could not read downloaded content: {e}"))?;
    if bytes.len() > max_bytes {
        return Err("Download exceeded the configured size limit.".to_string());
    }
    Ok(bytes.to_vec())
}

async fn fetch_verified_bytes(
    client: &reqwest::Client,
    url: &str,
    allowed_hosts: &[&str],
    expected_sha1: &str,
    expected_size: Option<u64>,
    max_size: u64,
) -> Result<Vec<u8>, String> {
    validate_sha1(expected_sha1)?;
    let bytes = fetch_bytes(client, url, allowed_hosts, max_size as usize).await?;
    verify_bytes(&bytes, expected_sha1, expected_size)?;
    Ok(bytes)
}

async fn download_artifact(
    client: &reqwest::Client,
    artifact: &DownloadArtifact,
    target: &Path,
    allowed_hosts: &[&str],
) -> Result<(), String> {
    download_verified(client, &artifact.url, target, &artifact.sha1, Some(artifact.size), allowed_hosts).await
}

async fn download_verified(
    client: &reqwest::Client,
    url: &str,
    target: &Path,
    expected_sha1: &str,
    expected_size: Option<u64>,
    allowed_hosts: &[&str],
) -> Result<(), String> {
    validate_sha1(expected_sha1)?;
    if let Some(size) = expected_size {
        if size > MAX_ARTIFACT_BYTES {
            return Err("Artifact exceeded the supported individual size.".to_string());
        }
    }
    if let (Some(size), Ok(metadata)) = (expected_size, std::fs::metadata(target)) {
        if metadata.len() == size {
            if let Ok(existing) = std::fs::read(target) {
                if verify_bytes(&existing, expected_sha1, expected_size).is_ok() {
                    return Ok(());
                }
            }
        }
    }

    let max_size = expected_size.unwrap_or(MAX_ARTIFACT_BYTES);
    let bytes = fetch_verified_bytes(client, url, allowed_hosts, expected_sha1, expected_size, max_size).await?;
    write_verified_bytes(target, &bytes, expected_sha1, expected_size)
}

fn write_verified_bytes(
    target: &Path,
    bytes: &[u8],
    expected_sha1: &str,
    expected_size: Option<u64>,
) -> Result<(), String> {
    verify_bytes(bytes, expected_sha1, expected_size)?;
    let parent = target
        .parent()
        .ok_or_else(|| "Download destination has no parent directory.".to_string())?;
    std::fs::create_dir_all(parent)
        .map_err(|e| format!("Could not create download directory {}: {e}", parent.display()))?;
    let file_name = target
        .file_name()
        .ok_or_else(|| "Download destination has no file name.".to_string())?
        .to_string_lossy();
    let temp = parent.join(format!("{file_name}.{}.part", std::process::id()));
    {
        let mut file = std::fs::OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .open(&temp)
            .map_err(|e| format!("Could not create temporary download: {e}"))?;
        file.write_all(bytes)
            .and_then(|_| file.sync_all())
            .map_err(|e| format!("Could not write temporary download: {e}"))?;
    }
    if target.exists() {
        std::fs::remove_file(target)
            .map_err(|e| format!("Could not replace invalid cached file {}: {e}", target.display()))?;
    }
    std::fs::rename(&temp, target).map_err(|e| {
        let _ = std::fs::remove_file(&temp);
        format!("Could not atomically install {}: {e}", target.display())
    })
}

fn verify_bytes(bytes: &[u8], expected_sha1: &str, expected_size: Option<u64>) -> Result<(), String> {
    if expected_size.is_some_and(|size| size != bytes.len() as u64) {
        return Err("Downloaded file size did not match the Mojang metadata.".to_string());
    }
    let actual = format!("{:x}", Sha1::digest(bytes));
    if !actual.eq_ignore_ascii_case(expected_sha1) {
        return Err("Downloaded file SHA-1 did not match the Mojang metadata.".to_string());
    }
    Ok(())
}

fn validate_sha1(value: &str) -> Result<(), String> {
    if value.len() == 40 && value.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        Ok(())
    } else {
        Err("Mojang metadata contained an invalid SHA-1 digest.".to_string())
    }
}

fn validate_url(url: &str, allowed_hosts: &[&str]) -> Result<(), String> {
    let parsed = reqwest::Url::parse(url).map_err(|e| format!("Invalid download URL: {e}"))?;
    if parsed.scheme() != "https"
        || parsed.username() != ""
        || parsed.password().is_some()
        || parsed.port().is_some()
        || !parsed.host_str().is_some_and(|host| allowed_hosts.contains(&host))
    {
        return Err("Refusing a download URL outside the approved HTTPS hosts.".to_string());
    }
    Ok(())
}

fn safe_relative_path(path: &str) -> Result<PathBuf, String> {
    let candidate = Path::new(path);
    if candidate.is_absolute()
        || candidate.components().any(|component| !matches!(component, Component::Normal(_)))
    {
        return Err("Mojang metadata contained an unsafe relative download path.".to_string());
    }
    Ok(candidate.to_path_buf())
}

fn rules_allow_windows(rules: Option<&[Rule]>) -> bool {
    let Some(rules) = rules else {
        return true;
    };
    let mut allowed = false;
    for rule in rules {
        let matches = rule.os.as_ref().is_none_or(|os| {
            os.name.as_deref().is_none_or(|name| name == "windows")
                && os.arch.as_deref().is_none_or(|arch| arch == "x86_64" || arch == "amd64")
        });
        if matches {
            allowed = rule.action == "allow";
        }
    }
    allowed
}

fn extract_windows_natives(archive_path: &Path, natives_dir: &Path) -> Result<(), String> {
    let bytes = std::fs::read(archive_path)
        .map_err(|e| format!("Could not read native archive {}: {e}", archive_path.display()))?;
    let mut archive = zip::ZipArchive::new(Cursor::new(bytes))
        .map_err(|e| format!("Invalid native archive {}: {e}", archive_path.display()))?;
    if archive.len() > 10_000 {
        return Err("Native archive contained too many entries.".to_string());
    }
    let mut expanded = 0u64;
    for index in 0..archive.len() {
        let mut entry = archive
            .by_index(index)
            .map_err(|e| format!("Could not read native archive entry: {e}"))?;
        let Some(relative) = entry.enclosed_name() else {
            return Err("Native archive contained an unsafe entry path.".to_string());
        };
        if relative.extension().and_then(|extension| extension.to_str()) != Some("dll") {
            continue;
        }
        if entry.size() > MAX_NATIVE_EXPANSION
            || expanded.checked_add(entry.size()).is_none_or(|size| size > MAX_NATIVE_EXPANSION)
        {
            return Err("Native archive exceeded the extraction size limit.".to_string());
        }
        expanded += entry.size();
        let destination = natives_dir.join(relative);
        let parent = destination
            .parent()
            .ok_or_else(|| "Native destination has no parent.".to_string())?;
        std::fs::create_dir_all(parent).map_err(|e| format!("Could not create native folder: {e}"))?;
        let mut bytes = Vec::with_capacity(entry.size() as usize);
        entry
            .read_to_end(&mut bytes)
            .map_err(|e| format!("Could not extract native file: {e}"))?;
        let temp = destination.with_extension(format!("dll.{}.part", std::process::id()));
        std::fs::write(&temp, bytes).map_err(|e| format!("Could not stage native file: {e}"))?;
        if destination.exists() {
            std::fs::remove_file(&destination).map_err(|e| format!("Could not replace native file: {e}"))?;
        }
        std::fs::rename(&temp, &destination).map_err(|e| {
            let _ = std::fs::remove_file(&temp);
            format!("Could not install native file: {e}")
        })?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validates_mojang_sha1_and_exact_size() {
        let digest = format!("{:x}", Sha1::digest(b"minecraft"));
        assert!(verify_bytes(b"minecraft", &digest, Some(9)).is_ok());
        assert!(verify_bytes(b"minecraft", &digest, Some(8)).is_err());
        assert!(verify_bytes(b"minecraft", "0000000000000000000000000000000000000000", None).is_err());
        assert!(validate_sha1(&digest).is_ok());
        assert!(validate_sha1("xyz").is_err());
    }

    #[test]
    fn download_urls_require_an_allowlisted_https_host() {
        assert!(validate_url("https://libraries.minecraft.net/example.jar", ARTIFACT_HOSTS).is_ok());
        assert!(validate_url("http://libraries.minecraft.net/example.jar", ARTIFACT_HOSTS).is_err());
        assert!(validate_url("https://evil.invalid/example.jar", ARTIFACT_HOSTS).is_err());
        assert!(validate_url("https://libraries.minecraft.net:444/example.jar", ARTIFACT_HOSTS).is_err());
    }

    #[test]
    fn library_paths_reject_traversal_and_absolute_paths() {
        assert!(safe_relative_path("org/example/library/1.0/library.jar").is_ok());
        assert!(safe_relative_path("../../outside.jar").is_err());
        assert!(safe_relative_path("/outside.jar").is_err());
    }

    #[test]
    fn windows_library_rules_use_last_matching_rule() {
        let allow_windows: Vec<Rule> = serde_json::from_str(
            r#"[{"action":"allow","os":{"name":"windows"}}]"#,
        )
        .unwrap();
        let deny_linux: Vec<Rule> = serde_json::from_str(
            r#"[{"action":"allow"},{"action":"disallow","os":{"name":"linux"}}]"#,
        )
        .unwrap();
        assert!(rules_allow_windows(Some(&allow_windows)));
        assert!(rules_allow_windows(Some(&deny_linux)));
        assert!(rules_allow_windows(None));
    }
}
