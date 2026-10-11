use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::path::Path;

/// Write bytes beside the destination and replace it without exposing a partial
/// destination file. On Windows this uses MoveFileExW with replace/write-through;
/// on Unix it uses same-filesystem rename and syncs the containing directory.
pub fn write_atomically(destination: &Path, bytes: &[u8]) -> io::Result<()> {
    let parent = destination.parent().ok_or_else(|| {
        io::Error::new(io::ErrorKind::InvalidInput, "destination has no parent directory")
    })?;
    let file_name = destination.file_name().ok_or_else(|| {
        io::Error::new(io::ErrorKind::InvalidInput, "destination has no file name")
    })?;
    fs::create_dir_all(parent)?;

    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let temporary = parent.join(format!(
        ".{}.{}.{}.tmp",
        file_name.to_string_lossy(),
        std::process::id(),
        nonce
    ));
    {
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temporary)?;
        if let Err(error) = file.write_all(bytes).and_then(|_| file.sync_all()) {
            let _ = fs::remove_file(&temporary);
            return Err(error);
        }
    }

    if let Err(error) = replace_file(&temporary, destination) {
        let _ = fs::remove_file(&temporary);
        return Err(error);
    }
    #[cfg(unix)]
    fs::File::open(parent)?.sync_all()?;
    Ok(())
}

fn replace_file(source: &Path, destination: &Path) -> io::Result<()> {
    if source.parent() != destination.parent() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "atomic replacement requires source and destination in the same directory",
        ));
    }

    #[cfg(windows)]
    {
        use std::os::windows::ffi::OsStrExt;
        use windows_sys::Win32::Storage::FileSystem::{
            MoveFileExW, MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH,
        };

        let source_wide: Vec<u16> = source.as_os_str().encode_wide().chain(Some(0)).collect();
        let destination_wide: Vec<u16> = destination
            .as_os_str()
            .encode_wide()
            .chain(Some(0))
            .collect();
        // SAFETY: both pointers refer to NUL-terminated UTF-16 buffers that live
        // for the duration of the call; MoveFileExW does not retain the pointers.
        let moved = unsafe {
            MoveFileExW(
                source_wide.as_ptr(),
                destination_wide.as_ptr(),
                MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
            )
        };
        if moved == 0 {
            return Err(io::Error::last_os_error());
        }
        Ok(())
    }

    #[cfg(not(windows))]
    {
        fs::rename(source, destination)
    }
}

#[cfg(test)]
mod tests {
    use super::{replace_file, write_atomically};
    use std::path::PathBuf;

    fn test_path(label: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "samrat-atomic-{label}-{}-{}.json",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_nanos()
        ))
    }

    #[test]
    fn replaces_existing_destination_without_partial_contents() {
        let path = test_path("replace");
        std::fs::write(&path, b"old contents").unwrap();
        write_atomically(&path, b"complete replacement").unwrap();
        assert_eq!(std::fs::read(&path).unwrap(), b"complete replacement");
        std::fs::remove_file(path).unwrap();
    }

    #[test]
    fn writes_new_destination() {
        let path = test_path("new");
        write_atomically(&path, b"new contents").unwrap();
        assert_eq!(std::fs::read(&path).unwrap(), b"new contents");
        std::fs::remove_file(path).unwrap();
    }

    #[test]
    fn rejects_cross_directory_replacement_and_preserves_destination() {
        let root = test_path("cross-dir");
        let source_parent = root.join("source");
        let destination_parent = root.join("destination");
        std::fs::create_dir_all(&source_parent).unwrap();
        std::fs::create_dir_all(&destination_parent).unwrap();
        let source = source_parent.join("staged.tmp");
        let destination = destination_parent.join("target.json");
        std::fs::write(&source, b"staged").unwrap();
        std::fs::write(&destination, b"original").unwrap();
        assert!(replace_file(&source, &destination).is_err());
        assert_eq!(std::fs::read(&destination).unwrap(), b"original");
        std::fs::remove_dir_all(root).unwrap();
    }
}
