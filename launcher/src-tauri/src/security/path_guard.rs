use std::path::{Path, PathBuf};

/// Guards against directory traversal and ensures the path is safely bounded within root.
pub fn is_safe_subpath<P: AsRef<Path>, B: AsRef<Path>>(base: B, target: P) -> bool {
    let base_canonical = match base.as_ref().canonicalize() {
        Ok(p) => p,
        Err(_) => return false,
    };

    let target_canonical = match target.as_ref().canonicalize() {
        Ok(p) => p,
        Err(_) => return false,
    };

    target_canonical.starts_with(base_canonical)
}

/// Sanitizes a filename to prevent invalid characters and path escapes.
pub fn sanitize_filename(filename: &str) -> String {
    filename
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '.' || *c == '_' || *c == '-')
        .collect()
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
