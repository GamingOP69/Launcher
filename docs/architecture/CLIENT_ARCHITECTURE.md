# Samrat Client Architecture

## Core Components

The Samrat Client is structured into modular layers designed for low garbage-collection overhead, high tick rates, and smooth frame pacing:

### 1. `SamratClient` & `SamratCore`
- **`SamratClient.java`**: The main client entry point and singleton container. It orchestrates initialization, registers JVM shutdown hooks, and measures startup duration.
- **`SamratCore.java`**: Central service registry exposing the EventBus, ModuleManager, ConfigManager, ProfileManager, HudManager, PerformanceManager, CrashReporter, and LogManager.

### 2. Zero-Allocation `EventBus`
- Dispatches events across priority buckets (`HIGHEST` down to `LOWEST` and `MONITOR`).
- Method reflection happens once upon registration; runtime dispatches execute via direct invocation wrappers.
- Supports cancelable events (`Cancellable`).

### 3. Module & Setting System
Modules are categorized into 8 functional areas:
- `PERFORMANCE`: FastMath lookup tables, frustum entity culling, particle density limiter, memory defragmenter, smart texture animations.
- `HUD`: FPS & 1% lows, CPS (left & right), Ping latency, Keystrokes, Armor status, Potion status, Coordinates, Compass direction, Server info, Clock.
- `PVP`: Combo streak counter, damage flash hit color, custom crosshair geometry, toggle sprint/sneak indicator, reach distance tracker.
- `BEDWARS`: 8-team bed matrix, team player counters, Diamond & Emerald generator upgrade timers, build height and void warning alert.
- `VISUAL`: Motion blur, client-side daylight time changer, block selection bounding overlay, 3D item physics.
- `PLAYER`: 360-degree freelook camera, auto-GG match responder, chat timestamps and compact message stacking.
- `WORLD` & `MISC`: Environment overlays and diagnostics.

### 4. Right Shift GUI & HUD Snapping Engine
- In-game configuration opened via `[RIGHT SHIFT]`.
- Interactive HUD editor with magnetic snap lines to screen bounds, center crosshair guides, and neighboring HUD elements.
- Real-time Performance Lab benchmark screen calculating Average FPS, 1% Lows, 0.1% Lows, and Frametime variance.
