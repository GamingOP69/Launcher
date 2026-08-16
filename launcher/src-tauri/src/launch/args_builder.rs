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
    pub fn build_jvm_args(config: &LaunchConfig, resolved_classpath: &str) -> Vec<String> {
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

        // 3. AWT/Swing headful mode (needed for StandaloneClientWindow)
        args.push("-Djava.awt.headless=false".to_string());

        // 4. User custom flags (appended, duplicates skipped)
        for flag in config.custom_jvm_args.split_whitespace() {
            if !flag.is_empty() && !args.contains(&flag.to_string()) {
                args.push(flag.to_string());
            }
        }

        // 5. Classpath + bootstrap class
        args.push("-cp".to_string());
        args.push(resolved_classpath.to_string());
        args.push("com.samrat.SamratClient".to_string());

        // 6. Game arguments
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

        args
    }
}
