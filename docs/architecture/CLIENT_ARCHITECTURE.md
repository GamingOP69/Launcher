# Samrat Client Architecture

## Shipped game-side code

`forge-client/` is the Java 8 Forge 1.8.9 mod installed by the Tauri launcher. It currently provides an informational in-game HUD with FPS, block coordinates, facing, movement-key state, and sprint state. Right Shift toggles this HUD. Values are gathered on the client tick and rendered on the overlay event. The mod does not automate combat, change player input, or send custom network actions.

The HUD string formatting is separated into `HudPresentation` so JUnit tests can check stable output and edge cases without launching Minecraft. Forge event wiring and main-menu integration are exercised by the JDK 8 Client Matrix job and packaged smoke. The latest clean package run is [38214127411](https://github.com/GamingOP69/Launcher/actions/runs/38214127411); CI software rendering does not establish physical GPU or gameplay compatibility.

## Preview code and roadmap

`client/` and `core/` contain the standalone Swing preview and supporting demo systems. They are not in the Minecraft classpath and do not supply live Minecraft modules, telemetry, or controls. Launcher module/profile presets remain preview-only and do not configure the Forge mod.

Additional client-side HUD and quality-of-life features can be added after each is implemented against Forge 1.8.9 events, tested for persistence and runtime behavior, and reviewed for fair-play compatibility. Avoid combat automation, anti-cheat evasion, packet manipulation, or claims that are not supported by measurements.

## Performance evidence

No FPS or frame-time benefit is claimed. Record a repeatable before/after baseline on the same real machine, world/scene, resolution, render settings, Java version, and GPU driver before describing performance changes. CI software OpenGL is useful for startup regressions only and is not representative hardware-performance evidence. See the [performance guide](../client/PERFORMANCE_GUIDE.md).
