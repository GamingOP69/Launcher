use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LaunchConfig {
    pub ram_mb: u32,
    pub java_path: String,
    pub custom_jvm_args: String,
    pub width: u32,
    pub height: u32,
    pub username: String,
    pub uuid: String,
    pub access_token: String,
    pub game_dir: String,
    pub assets_dir: String,
    pub client_jar_path: String,
}

pub struct ArgsBuilder;

impl ArgsBuilder {
    pub fn build_jvm_args(
        config: &LaunchConfig,
        resolved_classpath: &str,
        natives_dir: Option<&str>,
        main_class: &str,
    ) -> Vec<String> {
        let mut args = Vec::new();

        // 1. Memory (clamped 512MB – 16384MB)
        let safe_ram = config.ram_mb.clamp(512, 16384);
        args.push(format!("-Xms{}M", (safe_ram / 2).max(256)));
        args.push(format!("-Xmx{}M", safe_ram));

        // 2. G1GC for low-latency 1.8.9 PvP
        args.push("-XX:+UseG1GC".to_string());
        args.push("-XX:+UnlockExperimentalVMOptions".to_string());
        args.push("-XX:G1NewSizePercent=20".to_string());
        args.push("-XX:G1ReservePercent=20".to_string());
        args.push("-XX:MaxGCPauseMillis=50".to_string());
        args.push("-XX:G1HeapRegionSize=16M".to_string());

        // 3. AWT/Swing headful mode
        args.push("-Djava.awt.headless=false".to_string());

        // 4. Native libraries path for LWJGL OpenGL
        if let Some(nat) = natives_dir {
            if !nat.is_empty() {
                args.push(format!("-Djava.library.path={}", nat));
            }
        }

        // 5. User custom flags (appended, duplicates skipped)
        for flag in config.custom_jvm_args.split_whitespace() {
            if !flag.is_empty() && !args.contains(&flag.to_string()) {
                args.push(flag.to_string());
            }
        }

        // 6. Classpath + bootstrap class
        args.push("-cp".to_string());
        args.push(resolved_classpath.to_string());
        args.push(main_class.to_string());

        // 7. Game arguments
        if main_class.contains("net.minecraft") {
            args.push("--username".to_string());
            args.push(config.username.clone());
            args.push("--version".to_string());
            args.push("1.8.9".to_string());
            args.push("--gameDir".to_string());
            args.push(config.game_dir.clone());
            args.push("--assetsDir".to_string());
            args.push(config.assets_dir.clone());
            args.push("--assetIndex".to_string());
            args.push("1.8".to_string());
            args.push("--uuid".to_string());
            args.push(config.uuid.clone());
            args.push("--accessToken".to_string());
            args.push(if config.access_token.is_empty() { "0".to_string() } else { config.access_token.clone() });
            args.push("--userProperties".to_string());
            args.push("{}".to_string());
            args.push("--userType".to_string());
            args.push("legacy".to_string());
            args.push("--width".to_string());
            args.push(config.width.to_string());
            args.push("--height".to_string());
            args.push(config.height.to_string());
        } else {
            args.push("--username".to_string());
            args.push(config.username.clone());
            args.push("--uuid".to_string());
            args.push(config.uuid.clone());
            args.push("--gameDir".to_string());
            args.push(config.game_dir.clone());
            args.push("--assetsDir".to_string());
            args.push(config.assets_dir.clone());
            args.push("--width".to_string());
            args.push(config.width.to_string());
            args.push("--height".to_string());
            args.push(config.height.to_string());
        }

        args
    }
}
