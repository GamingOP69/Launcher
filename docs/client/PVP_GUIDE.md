# Samrat Client — PvP Quality-of-Life Guide

## Implemented in the Forge 1.8.9 client

- **Informational HUD:** FPS, integer block coordinates, facing, movement-key state, and sprint state. Press **Right Shift** to show or hide it. It reads local client state and does not change movement or combat.
- **Static custom crosshair:** Four white arms centered on the game viewport. Press **Right Control** to replace or restore Minecraft's crosshair. It does not use target information, dynamic spread, or combat automation.

The crosshair defaults to Minecraft's normal rendering each launch. The current toggle state is in-memory only and is not persisted.

## Fair-play and support limits

These are client-side visual/informational options. They do not alter packets, attack timing, reach, movement, visibility of hidden entities, or server state. A client-side feature can still be restricted by an individual server's rules; check that server's current policy before use.

Combo tracking, hit-color replacement, automated sprint/sneak, reach measurement, and the other module/profile controls shown in the launcher are **not implemented in the packaged Forge mod**. Treat those screens as previews only; this guide does not promise those features. Microsoft authentication and online-mode server access are separate launcher concerns and are not supplied by local profiles.

## Validation

Forge unit tests cover HUD formatting and crosshair geometry. The packaged CI smoke proves that Forge initializes and Minecraft reaches the main menu, but it does not enter a world or verify rendering/key input. Before release, manually check the HUD and crosshair toggles in a single-player world on a supported Windows GPU, including window resize and a second launch to confirm the crosshair returns to its default state.
