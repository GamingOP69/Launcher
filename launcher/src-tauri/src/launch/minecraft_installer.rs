use std::io::Cursor;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Emitter};

pub struct MinecraftInstaller;

impl MinecraftInstaller {
    pub async fn ensure_minecraft_189_installed(
        app: Option<&AppHandle>,
        samrat_dir: &Path,
    ) -> Result<(String, String), String> {
        let versions_dir = samrat_dir.join("versions").join("1.8.9");
        let libraries_dir = samrat_dir.join("libraries");
        let natives_dir = samrat_dir.join("natives");
        let assets_dir = samrat_dir.join("assets");
        let indexes_dir = assets_dir.join("indexes");

        std::fs::create_dir_all(&versions_dir).map_err(|e| e.to_string())?;
        std::fs::create_dir_all(&libraries_dir).map_err(|e| e.to_string())?;
        std::fs::create_dir_all(&natives_dir).map_err(|e| e.to_string())?;
        std::fs::create_dir_all(&indexes_dir).map_err(|e| e.to_string())?;

        let client_jar = versions_dir.join("1.8.9.jar");

        let client = reqwest::Client::builder()
            .user_agent("SamratLauncher/1.0.0")
            .timeout(std::time::Duration::from_secs(60))
            .build()
            .map_err(|e| format!("HTTP client error: {}", e))?;

        // 1. Download vanilla 1.8.9.jar if not present
        if !client_jar.is_file() {
            if let Some(app_handle) = app {
                let _ = app_handle.emit(
                    "install_progress",
                    serde_json::json!({"stage": "Downloading Minecraft 1.8.9 Client", "percent": 20}),
                );
            }

            let client_url = "https://piston-data.mojang.com/v1/objects/a0fe178d8a7c293776e737cbe113b29c9b74052f/client.jar";
            let bytes = client
                .get(client_url)
                .send()
                .await
                .map_err(|e| format!("Failed to download 1.8.9 client: {}", e))?
                .bytes()
                .await
                .map_err(|e| format!("Failed to read 1.8.9 client data: {}", e))?;

            std::fs::write(&client_jar, &bytes)
                .map_err(|e| format!("Failed to write 1.8.9.jar: {}", e))?;
        }

        // 2. Download 1.8 asset index if not present
        let index_file = indexes_dir.join("1.8.json");
        if !index_file.is_file() {
            let index_url = "https://launchermeta.mojang.com/v1/packages/5c9029a1da23e20e8d0426027a0aa4c45b73663a/1.8.json";
            if let Ok(resp) = client.get(index_url).send().await {
                if let Ok(bytes) = resp.bytes().await {
                    let _ = std::fs::write(&index_file, &bytes);
                }
            }
        }

        // 3. Essential Minecraft 1.8.9 Libraries
        let libraries = [
            ("net/sf/jopt-simple/jopt-simple/4.6/jopt-simple-4.6.jar", "https://libraries.minecraft.net/net/sf/jopt-simple/jopt-simple/4.6/jopt-simple-4.6.jar"),
            ("com/google/guava/guava/17.0/guava-17.0.jar", "https://libraries.minecraft.net/com/google/guava/guava/17.0/guava-17.0.jar"),
            ("org/apache/commons/commons-lang3/3.3.2/commons-lang3-3.3.2.jar", "https://libraries.minecraft.net/org/apache/commons/commons-lang3/3.3.2/commons-lang3-3.3.2.jar"),
            ("commons-io/commons-io/2.4/commons-io-2.4.jar", "https://libraries.minecraft.net/commons-io/commons-io/2.4/commons-io-2.4.jar"),
            ("commons-codec/commons-codec/1.9/commons-codec-1.9.jar", "https://libraries.minecraft.net/commons-codec/commons-codec/1.9/commons-codec-1.9.jar"),
            ("net/java/jinput/jinput/2.0.5/jinput-2.0.5.jar", "https://libraries.minecraft.net/net/java/jinput/jinput/2.0.5/jinput-2.0.5.jar"),
            ("net/java/jutils/jutils/1.0.0/jutils-1.0.0.jar", "https://libraries.minecraft.net/net/java/jutils/jutils/1.0.0/jutils-1.0.0.jar"),
            ("com/google/code/gson/gson/2.2.4/gson-2.2.4.jar", "https://libraries.minecraft.net/com/google/code/gson/gson/2.2.4/gson-2.2.4.jar"),
            ("com/mojang/authlib/1.5.21/authlib-1.5.21.jar", "https://libraries.minecraft.net/com/mojang/authlib/1.5.21/authlib-1.5.21.jar"),
            ("com/mojang/realms/1.7.59/realms-1.7.59.jar", "https://libraries.minecraft.net/com/mojang/realms/1.7.59/realms-1.7.59.jar"),
            ("org/apache/commons/commons-compress/1.8.1/commons-compress-1.8.1.jar", "https://libraries.minecraft.net/org/apache/commons/commons-compress/1.8.1/commons-compress-1.8.1.jar"),
            ("org/apache/httpcomponents/httpclient/4.3.3/httpclient-4.3.3.jar", "https://libraries.minecraft.net/org/apache/httpcomponents/httpclient/4.3.3/httpclient-4.3.3.jar"),
            ("commons-logging/commons-logging/1.1.3/commons-logging-1.1.3.jar", "https://libraries.minecraft.net/commons-logging/commons-logging/1.1.3/commons-logging-1.1.3.jar"),
            ("org/apache/httpcomponents/httpcore/4.3.2/httpcore-4.3.2.jar", "https://libraries.minecraft.net/org/apache/httpcomponents/httpcore/4.3.2/httpcore-4.3.2.jar"),
            ("org/apache/logging/log4j/log4j-api/2.0-beta9/log4j-api-2.0-beta9.jar", "https://libraries.minecraft.net/org/apache/logging/log4j/log4j-api/2.0-beta9/log4j-api-2.0-beta9.jar"),
            ("org/apache/logging/log4j/log4j-core/2.0-beta9/log4j-core-2.0-beta9.jar", "https://libraries.minecraft.net/org/apache/logging/log4j/log4j-core/2.0-beta9/log4j-core-2.0-beta9.jar"),
            ("org/lwjgl/lwjgl/lwjgl/2.9.4-nightly-20150209/lwjgl-2.9.4-nightly-20150209.jar", "https://libraries.minecraft.net/org/lwjgl/lwjgl/lwjgl/2.9.4-nightly-20150209/lwjgl-2.9.4-nightly-20150209.jar"),
            ("org/lwjgl/lwjgl/lwjgl_util/2.9.4-nightly-20150209/lwjgl_util-2.9.4-nightly-20150209.jar", "https://libraries.minecraft.net/org/lwjgl/lwjgl/lwjgl_util/2.9.4-nightly-20150209/lwjgl_util-2.9.4-nightly-20150209.jar"),
            ("io/netty/netty-all/4.0.23.Final/netty-all-4.0.23.Final.jar", "https://libraries.minecraft.net/io/netty/netty-all/4.0.23.Final/netty-all-4.0.23.Final.jar"),
            ("com/ibm/icu/icu4j-core-mojang/51.2/icu4j-core-mojang-51.2.jar", "https://libraries.minecraft.net/com/ibm/icu/icu4j-core-mojang/51.2/icu4j-core-mojang-51.2.jar"),
        ];

        let mut classpath_entries: Vec<PathBuf> = Vec::new();

        for (rel_path, url) in &libraries {
            let lib_dest = libraries_dir.join(rel_path);
            if let Some(parent) = lib_dest.parent() {
                let _ = std::fs::create_dir_all(parent);
            }

            if !lib_dest.is_file() {
                if let Ok(resp) = client.get(*url).send().await {
                    if let Ok(bytes) = resp.bytes().await {
                        let _ = std::fs::write(&lib_dest, &bytes);
                    }
                }
            }

            if lib_dest.is_file() {
                classpath_entries.push(lib_dest);
            }
        }

        // 4. Download & Extract Windows Native Libraries (LWJGL DLLs)
        let natives_jars = [
            "https://libraries.minecraft.net/org/lwjgl/lwjgl/lwjgl-platform/2.9.4-nightly-20150209/lwjgl-platform-2.9.4-nightly-20150209-natives-windows.jar",
            "https://libraries.minecraft.net/net/java/jinput/jinput-platform/2.0.5/jinput-platform-2.0.5-natives-windows.jar",
        ];

        for native_url in &natives_jars {
            if let Ok(resp) = client.get(*native_url).send().await {
                if let Ok(bytes) = resp.bytes().await {
                    if let Ok(mut archive) = zip::ZipArchive::new(Cursor::new(bytes)) {
                        for i in 0..archive.len() {
                            if let Ok(mut file) = archive.by_index(i) {
                                if file.name().ends_with(".dll") {
                                    let outpath = natives_dir.join(file.name());
                                    if let Ok(mut outfile) = std::fs::File::create(&outpath) {
                                        let _ = std::io::copy(&mut file, &mut outfile);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Add 1.8.9.jar to classpath
        classpath_entries.push(client_jar);

        // Build classpath separator (: on Unix, ; on Windows)
        #[cfg(target_os = "windows")]
        let sep = ";";
        #[cfg(not(target_os = "windows"))]
        let sep = ":";

        let cp_string = classpath_entries
            .iter()
            .map(|p| p.to_string_lossy().to_string())
            .collect::<Vec<String>>()
            .join(sep);

        Ok((cp_string, natives_dir.to_string_lossy().to_string()))
    }
}
