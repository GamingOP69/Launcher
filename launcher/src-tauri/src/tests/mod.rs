use crate::auth::microsoft_auth::create_dev_sandbox_account;
use crate::auth::account_manager::AccountManager;
use crate::commands::{download_client, download_curated_mod, get_curated_mods, launch_game, valid_minecraft_username};
use crate::launch::args_builder::{ArgsBuilder, LaunchConfig};
use crate::security::path_guard::{is_safe_existing_subpath, is_safe_subpath, normalize_path, sanitize_filename};
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

#[tokio::test]
async fn update_check_rejects_unrecognized_channels() {
    let error = crate::updater::updater_service::UpdaterService::check_for_updates("1.0.0", "../../evil")
        .await
        .unwrap_err();
    assert!(error.contains("Unsupported update channel"));
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
        custom_jvm_args: "-Dsamrat.debug=true -Xmx64M -javaagent:untrusted.jar -cp untrusted.jar -Djava.library.path=untrusted".to_string(),
        width: 1920,
        height: 1080,
        username: "SamratTester".to_string(),
        uuid: "c06f8906-4c8a-4911-9c29-ea1db5022e33".to_string(),
        access_token: "mock_token".to_string(),
        game_dir: ".samrat/game".to_string(),
        assets_dir: ".samrat/assets".to_string(),
        asset_index: "1.8".to_string(),
    };

    let args = ArgsBuilder::build_jvm_args(&config, "client.jar", None, "com.samrat.SamratClient");

    assert!(args.contains(&"-Xmx4096M".to_string()));
    assert!(args.contains(&"-XX:+UseG1GC".to_string()));
    assert!(args.contains(&"-Dsamrat.debug=true".to_string()));
    assert!(!args.contains(&"-Xmx64M".to_string()));
    assert!(!args.contains(&"-javaagent:untrusted.jar".to_string()));
    assert!(!args.contains(&"untrusted.jar".to_string()));
    assert!(!args.contains(&"-Djava.library.path=untrusted".to_string()));
    assert!(args.contains(&"--username".to_string()));
    assert!(args.contains(&"SamratTester".to_string()));
    assert!(args.contains(&"com.samrat.SamratClient".to_string()));
    assert!(args.contains(&"-Djava.awt.headless=false".to_string()));
}

#[tokio::test]
async fn unverified_mod_catalog_is_empty_and_downloads_fail_closed() {
    assert!(get_curated_mods().await.unwrap().is_empty());
    let error = download_curated_mod("optifine_189".to_string()).await.unwrap_err();
    assert!(error.contains("verified artifact"));
}

#[tokio::test]
async fn client_install_does_not_accept_the_legacy_preview_artifact() {
    let error = download_client().await.unwrap_err();
    assert!(error.contains("real 1.8.9 integration"));
}

#[tokio::test]
async fn game_launch_is_disabled_until_the_real_client_is_available() {
    let error = launch_game().await.unwrap_err();
    assert!(error.contains("real 1.8.9 client integration"));
}

#[test]
fn local_account_names_follow_minecraft_username_rules() {
    assert!(valid_minecraft_username("PvP_Player9"));
    assert!(valid_minecraft_username("  Player  "));
    assert!(!valid_minecraft_username("ab"));
    assert!(!valid_minecraft_username("player name"));
    assert!(!valid_minecraft_username("player/../x"));
    assert!(!valid_minecraft_username("玩家123"));
}

#[test]
fn offline_profile_uses_minecraft_offline_uuid_format() {
    let profile = AccountManager::create_offline_account("Notch", "steve");
    assert_eq!(profile.uuid, "b50ad385-829d-3141-a216-7e7d7539ba7f");
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

#[test]
fn canonical_path_guard_checks_existing_targets() {
    let root = std::env::temp_dir().join(format!("samrat-path-guard-{}", std::process::id()));
    let inside = root.join("inside");
    let outside = root.with_extension("outside");
    std::fs::create_dir_all(&inside).unwrap();
    std::fs::create_dir_all(&outside).unwrap();
    let inside_file = inside.join("update.bin");
    let outside_file = outside.join("outside.bin");
    std::fs::write(&inside_file, b"inside").unwrap();
    std::fs::write(&outside_file, b"outside").unwrap();

    assert!(is_safe_existing_subpath(&root, &inside_file));
    assert!(!is_safe_existing_subpath(&root, &outside_file));
    assert!(!is_safe_existing_subpath(&root, inside.join("missing.bin")));

    #[cfg(unix)]
    {
        let mixed_case = std::env::temp_dir().join(format!("SamratCaseGuard-{}", std::process::id()));
        let different_case = std::env::temp_dir().join(format!("samratcaseguard-{}", std::process::id()));
        std::fs::create_dir_all(&mixed_case).unwrap();
        std::fs::create_dir_all(&different_case).unwrap();
        let sibling_file = different_case.join("sibling.bin");
        std::fs::write(&sibling_file, b"sibling").unwrap();
        assert!(!is_safe_existing_subpath(&mixed_case, &sibling_file));
        std::fs::remove_dir_all(&mixed_case).unwrap();
        std::fs::remove_dir_all(&different_case).unwrap();
    }

    std::fs::remove_dir_all(&root).unwrap();
    std::fs::remove_dir_all(&outside).unwrap();
}

#[cfg(unix)]
#[test]
fn canonical_path_guard_rejects_symlink_escape() {
    use std::os::unix::fs::symlink;

    let root = std::env::temp_dir().join(format!("samrat-symlink-guard-{}", std::process::id()));
    let outside = root.with_extension("outside");
    std::fs::create_dir_all(&root).unwrap();
    std::fs::create_dir_all(&outside).unwrap();
    let target = outside.join("secret.bin");
    std::fs::write(&target, b"secret").unwrap();
    let link = root.join("linked.bin");
    symlink(&target, &link).unwrap();

    assert!(!is_safe_existing_subpath(&root, &link));

    std::fs::remove_dir_all(&root).unwrap();
    std::fs::remove_dir_all(&outside).unwrap();
}
