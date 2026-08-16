use std::path::{Component, Path, PathBuf};

/// Normalizes a path by removing CurDir (.) and resolving ParentDir (..) components without accessing disk.
pub fn normalize_path<P: AsRef<Path>>(path: P) -> PathBuf {
    let mut components = Vec::new();
    for component in path.as_ref().components() {
        match component {
            Component::Prefix(prefix) => components.push(Component::Prefix(prefix)),
            Component::RootDir => components.push(Component::RootDir),
            Component::CurDir => {}
            Component::ParentDir => {
                if let Some(Component::Normal(_)) = components.last() {
                    components.pop();
                } else {
                    components.push(Component::ParentDir);
                }
            }
            Component::Normal(c) => components.push(Component::Normal(c)),
        }
    }
    components.iter().collect()
}

/// Guards against directory traversal and ensures the target path is safely bounded within the base root.
pub fn is_safe_subpath<P: AsRef<Path>, B: AsRef<Path>>(base: B, target: P) -> bool {
    let base_norm = normalize_path(base);
    let target_norm = normalize_path(target);

    let base_comps: Vec<_> = base_norm.components().collect();
    let target_comps: Vec<_> = target_norm.components().collect();

    if target_comps.len() < base_comps.len() {
        return false;
    }

    for (b, t) in base_comps.iter().zip(target_comps.iter()) {
        let b_str = b.as_os_str().to_string_lossy().to_lowercase();
        let t_str = t.as_os_str().to_string_lossy().to_lowercase();
        if b_str != t_str {
            return false;
        }
    }

    !target_comps[base_comps.len()..].contains(&Component::ParentDir)
}

/// Sanitizes a filename to prevent invalid characters, path escapes, and leading dots.
pub fn sanitize_filename(filename: &str) -> String {
    let mut cleaned = String::with_capacity(filename.len());
    for c in filename.chars() {
        if c.is_alphanumeric() || c == '.' || c == '_' || c == '-' {
            cleaned.push(c);
        }
    }

    let trimmed = cleaned.trim_start_matches('.').trim_end_matches('.');
    if trimmed.is_empty() {
        "unnamed".to_string()
    } else {
        trimmed.to_string()
    }
}

pub fn get_samrat_data_dir() -> PathBuf {
    dirs_fallback().join(".samrat")
}

fn dirs_fallback() -> PathBuf {
    if let Ok(home) = std::env::var("USERPROFILE") {
        PathBuf::from(home)
    } else if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home)
    } else {
        PathBuf::from(".")
    }
}
