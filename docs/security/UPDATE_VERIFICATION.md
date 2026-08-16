# Update Integrity & Verification System

## Update Architecture

```mermaid
sequenceDiagram
    participant Launcher as Samrat Launcher
    participant GitHub as GitHub Releases / Manifest
    participant LocalDisk as Local Disk / Staging

    Launcher->>GitHub: GET /update-manifest-stable.json
    GitHub-->>Launcher: Return Version, Changelog & SHA-256 Hashes
    
    alt Newer Version Available
        Launcher->>GitHub: Download Client Jar / MSI Installer
        Launcher->>LocalDisk: Save to Staging Directory
        Launcher->>Launcher: Compute SHA-256 Checksum
        alt Checksum Matches Manifest
            Launcher->>LocalDisk: Apply & Replace Existing Binary
            Launcher->>Launcher: Restart Application Cleanly
        else Checksum Mismatch
            Launcher->>LocalDisk: Delete Corrupted Staging File
            Launcher->>Launcher: Log Security Warning & Abort Update
        end
    end
```

## Manifest Schema

Manifests must adhere to the JSON schema defined in [`shared/schemas/update-manifest.schema.json`](file:///c:/Github/Launcher/shared/schemas/update-manifest.schema.json).
Each artifact entry must specify:
- `url`: Direct HTTPS download link
- `sha256`: 64-character hexadecimal SHA-256 hash
- `sizeBytes`: Exact binary size in bytes
