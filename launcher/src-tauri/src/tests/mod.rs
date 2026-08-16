use crate::auth::microsoft_auth::create_dev_sandbox_account;
use crate::launch::args_builder::{ArgsBuilder, LaunchConfig};
use crate::security::path_guard::{is_safe_subpath, normalize_path, sanitize_filename};
use crate::security::sanitizer::sanitize_log;
use crate::updater::updater_service::is_newer_version;
use std::path::Path;

#[test]
fn test_semver_comparison() {
    assert!(is_newer_version("1.0.0", "1.0.1"));
    assert!(is_newer_version("1.0.0", "1.1.0"));
    assert!(is_newer_version("1.0.0", "2.0.0"));
    assert!(!is_newer_version("1.0.1", "1.0.0"));
    assert!(!is_newer_version("1.0.0", "1.0.0"));
}

#[test]
fn test_log_sanitizer() {
    let raw = "Bearer eyJhbGciOiJIUzI1NiJ9 with password: my_secret_pass and email test@example.com";
    let clean = sanitize_log(raw);

    assert!(!clean.contains("eyJhbGciOiJIUzI1NiJ9"));
    assert!(!clean.contains("my_secret_pass"));
    assert!(!clean.contains("test@example.com"));
    assert!(clean.contains("[REDACTED_BEARER]"));
}

#[test]
fn test_jvm_args_builder() {
    let config = LaunchConfig {
        ram_mb: 4096,
        java_path: "C:\\Program Files\\Java\\bin\\java.exe".to_string(),
        custom_jvm_args: "-Dsamrat.debug=true".to_string(),
        width: 1920,
        height: 1080,
        username: "SamratTester".to_string(),
        uuid: "c06f8906-4c8a-4911-9c29-ea1db5022e33".to_string(),
        access_token: "mock_token".to_string(),
        game_dir: ".samrat/game".to_string(),
        assets_dir: ".samrat/assets".to_string(),
        client_jar_path: "client.jar".to_string(),
    };

    let args = ArgsBuilder::build_jvm_args(&config, "client.jar");

    assert!(args.contains(&"-Xmx4096M".to_string()));
    assert!(args.contains(&"-XX:+UseG1GC".to_string()));
    assert!(args.contains(&"-Dsamrat.debug=true".to_string()));
    assert!(args.contains(&"--username".to_string()));
    assert!(args.contains(&"SamratTester".to_string()));
    assert!(args.contains(&"com.samrat.SamratClient".to_string()));
}

#[test]
fn test_dev_sandbox_account() {
    let account = create_dev_sandbox_account("PvPPro");
    assert_eq!(account.username, "PvPPro");
    assert!(account.is_dev_mode);
    assert_eq!(account.id, "dev-pvppro");
}

#[test]
fn test_filename_sanitizer() {
    let safe = sanitize_filename("..//invalid?file*name_123.jar");
    assert_eq!(safe, "invalidfilename_123.jar");

    let safe_dots = sanitize_filename("...secret.dat...");
    assert_eq!(safe_dots, "secret.dat");

    let safe_empty = sanitize_filename("???***///");
    assert_eq!(safe_empty, "unnamed");
}

#[test]
fn test_path_guard_containment() {
    // Normal nested subpath
    assert!(is_safe_subpath(Path::new("C:/samrat"), Path::new("C:/samrat/game")));
    assert!(is_safe_subpath(Path::new("C:\\samrat"), Path::new("C:\\samrat\\game\\assets")));

    // Relative subpath
    assert!(is_safe_subpath(Path::new(".samrat"), Path::new(".samrat/profiles/default.json")));

    // Case insensitivity
    assert!(is_safe_subpath(Path::new("c:/Samrat"), Path::new("C:/samrat/game")));

    // Escape via parent directory
    assert!(!is_safe_subpath(Path::new("C:/samrat"), Path::new("C:/samrat/../Windows/System32")));
    assert!(!is_safe_subpath(Path::new("C:/samrat"), Path::new("C:/Windows/System32")));

    // Prefix collision protection
    assert!(!is_safe_subpath(Path::new("C:/samrat"), Path::new("C:/samrat2/game")));
    assert!(!is_safe_subpath(Path::new("C:/samrat"), Path::new("D:/samrat/game")));
}

#[test]
fn test_normalize_path() {
    let p = normalize_path(Path::new("a/b/../c/./d"));
    assert_eq!(p, Path::new("a/c/d"));
}
