# Performance Measurement Guide

The launcher does not promise zero bugs, guaranteed FPS gains, or superiority over another client. The current Forge mod is an informational HUD; no optimization or performance gain has been established.

## Before/after procedure

Measure on the same physical Windows machine with the same GPU/driver, Java 8 runtime, Minecraft version, resolution, render distance, graphics settings, world or repeatable scene, and background workload. Record the baseline and changed build commit IDs. Warm the game for the same period before each sample, capture at least three runs per build, and report median FPS plus frame-time percentiles (50th, 95th, and 99th) with the sample duration. Record any crashes, stutters, and measurement-tool overhead. Do not compare CI Mesa/llvmpipe results with hardware-rendered results.

If a change is intended to reduce overhead, first capture the baseline with the feature disabled, then enable only that change and repeat the same measurements. Report raw results and conditions; do not generalize one machine's result to other hardware.

## Current limitation

No before/after measurement has been recorded for the Forge client. GitHub Actions validates builds and startup using software rendering; it cannot replace a real GPU/gameplay check. The launcher diagnostics currently do not provide verified live game telemetry.
