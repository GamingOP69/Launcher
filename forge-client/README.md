# Forge 1.8.9 client module

This module targets Minecraft 1.8.9 with Forge `11.15.1.2318` and is separate from the Swing preview. The mod draws an informational HUD with FPS, block coordinates, facing direction, movement-key state, and sprint state while in a world. Press Right Shift to toggle the HUD. These are client-side display features; the mod does not automate combat or change player/network actions.

GitHub Actions builds and tests this module using the legacy-compatible JDK 8 / Gradle 2.14.1 toolchain, then starts the Forge development client under Xvfb. A CI-only JVM property makes the mod record a marker when Forge opens the Minecraft main menu and then exit. The smoke property is absent in ordinary launches. A clean Windows package run [38214127411](https://github.com/GamingOP69/Launcher/actions/runs/38214127411) has also reached the Forge main menu with the packaged mod initialized; it does not prove physical GPU compatibility or gameplay behavior.

This module is bundled by the Windows Actions package workflow and installed into the pinned Forge profile before launch. Other module/profile controls shown in the launcher UI are previews and do not alter this mod. See [`docs/REMEDIATION_STATUS.md`](../docs/REMEDIATION_STATUS.md) for evidence and remaining checks.
