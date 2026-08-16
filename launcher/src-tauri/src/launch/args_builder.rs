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

        // 1. Memory allocation (Clamped safely between 1024MB and 32768MB)
        let safe_ram = config.ram_mb.clamp(1024, 32768);
        args.push(format!("-Xms{}M", safe_ram / 2));
        args.push(format!("-Xmx{}M", safe_ram));

        // 2. High-Performance G1GC Garbage Collection flags
        args.push("-XX:+UseG1GC".to_string());
        args.push("-XX:+UnlockExperimentalVMOptions".to_string());
        args.push("-XX:G1NewSizePercent=20".to_string());
        args.push("-XX:G1ReservePercent=20".to_string());
        args.push("-XX:MaxGCPauseMillis=50".to_string());
        args.push("-XX:G1HeapRegionSize=32M".to_string());
        args.push("-Dsun.rmi.dgc.server.gcInterval=2147483646".to_string());

        // 3. User custom JVM flags
        for flag in config.custom_jvm_args.split_whitespace() {
            if !flag.is_empty() && !args.contains(&flag.to_string()) {
                args.push(flag.to_string());
            }
        }

        // 4. Classpath and Primary Client Main Class
        args.push("-cp".to_string());
        args.push(resolved_classpath.to_string());
        args.push("com.samrat.SamratClient".to_string());

        // 5. Game launch parameters
        args.push("--version".to_string());
        args.push("1.8.9-SamratClient".to_string());
        args.push("--gameDir".to_string());
        args.push(config.game_dir.clone());
        args.push("--assetsDir".to_string());
        args.push(config.assets_dir.clone());
        args.push("--username".to_string());
        args.push(config.username.clone());
        args.push("--uuid".to_string());
        args.push(config.uuid.clone());
        args.push("--width".to_string());
        args.push(config.width.to_string());
        args.push("--height".to_string());
        args.push(config.height.to_string());

        args
    }
}
