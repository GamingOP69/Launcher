# Forge 1.8.9 client module

This isolated module targets Minecraft 1.8.9 with Forge `11.15.1.2318`. It is a real Forge mod source set, separate from the Swing preview. The first increment registers a Forge mod, renders a small client-side marker while in a world, and logs Forge initialization.

GitHub Actions builds this module using the legacy-compatible JDK 8 / Gradle 2.14.1 toolchain, then starts the Forge development client under Xvfb. A CI-only JVM property makes the mod record a marker when Forge opens the Minecraft main menu and then exit. The smoke property is absent in ordinary launches.

This module is not yet integrated with the Tauri install or launch pipeline. A green module build or development smoke does not prove the packaged launcher installs the runtime or launches Minecraft. See [`docs/REMEDIATION_STATUS.md`](../docs/REMEDIATION_STATUS.md).
