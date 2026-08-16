# Samrat Launcher & Client Configuration Schema

All settings are versioned to ensure backward compatibility and automatic schema migrations.

## Launcher Configuration (`~/.samrat/launcher-config.json`)

```json
{
  "schemaVersion": 1,
  "selectedAccountId": "ms-user-12345",
  "selectedProfileId": "Bedwars",
  "allocatedRamMb": 3072,
  "javaPath": "C:\\Program Files\\Eclipse Adoptium\\jdk-8.0.382.05-hotspot\\bin\\java.exe",
  "customJvmArgs": "-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M",
  "closeLauncherOnGameStart": true,
  "enableHardwareAcceleration": true,
  "autoCheckUpdates": true,
  "releaseChannel": "stable",
  "gameResolutionWidth": 1920,
  "gameResolutionHeight": 1080
}
```

## Client Configuration (`~/.samrat/config.json`)

```json
{
  "configVersion": 2,
  "activeProfile": "Default",
  "rightShiftKey": 54,
  "uiScale": 1.0,
  "accentColor": "#00F0FF",
  "modules": {
    "FPS": {
      "enabled": true,
      "keybind": 0,
      "settings": {
        "1% Low": "true",
        "Frametime": "false",
        "Style": "Standard"
      }
    }
  },
  "hudElements": {
    "fps_hud": {
      "x": 4.0,
      "y": 4.0,
      "scale": 1.0,
      "visible": true
    }
  }
}
```
