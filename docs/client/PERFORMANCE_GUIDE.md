# Samrat Client — Performance Engine & Benchmarking Guide

> **Status:** This document describes unverified implementation ideas. The current Java code is not hooked into Minecraft 1.8.9; no FPS or frametime benefit has been demonstrated. A repeatable real-game baseline and post-change measurement are required before making performance claims.

## Optimization Architecture

1. **FastMath Lookup Tables (`FastMath.java`)**:
   - 65,536-entry precomputed trigonometric sine and cosine tables.
   - Replaces CPU-expensive native calls in rotation, rendering, and entity movement routines.

2. **Frustum & Distance Entity Culling (`EntityCullingModule.java`)**:
   - Skips OpenGL render draw calls for entities located behind the player camera or beyond the configurable block radius.

3. **Smart Texture Animations (`SmartAnimationsModule.java`)**:
   - Pauses animated texture memory uploads (water, lava, portal) when off-screen.

4. **Particle Density Limiter (`ParticleOptimizerModule.java`)**:
   - Caps simultaneous particles to prevent FPS drops during massive TNT explosions or particle spam.

5. **Heap Usage Reporting (`MemoryOptimizerModule.java`)**:
   - Reports current JVM heap usage. It does not force garbage collection or promise to reduce stutter.

## Performance Presets

| Preset | Target Hardware | Render Distance | FastMath | Entity Culling | Particles |
| ------ | --------------- | --------------- | -------- | -------------- | --------- |
| **Quality** | High-end PCs | 16 Chunks | Yes | No | 2000 |
| **Balanced** | Standard rigs | 12 Chunks | Yes | Yes | 1000 |
| **High FPS** | Competitive PvP | 8 Chunks | Yes | Yes | 500 |
| **Ultra FPS** | Low-end & Laptops | 6 Chunks | Yes | Yes | 200 |

## In-Game Benchmark (Performance Lab)
Open the in-game Right-Shift menu and navigate to the **Performance Lab** to run an automated 10-second frame pacing benchmark measuring Average FPS, Minimum FPS, 1% Lows, 0.1% Lows, and Frametime variance.
