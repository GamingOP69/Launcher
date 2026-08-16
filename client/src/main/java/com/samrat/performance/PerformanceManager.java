package com.samrat.performance;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class PerformanceManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(PerformanceManager.class);

    private PerformancePreset activePreset = PerformancePreset.BALANCED;
    private final BenchmarkEngine benchmarkEngine = new BenchmarkEngine();

    private boolean entityCulling = true;
    private boolean particleLimiter = true;
    private boolean fastMathEnabled = true;
    private boolean smartAnimations = true;
    private boolean autoDefragMemory = true;

    public void initialize() {
        LOGGER.info("Initializing Samrat Performance Manager with preset: {}", activePreset.getDisplayName());
        applyPreset(activePreset);
    }

    public void applyPreset(PerformancePreset preset) {
        if (preset == null) return;
        this.activePreset = preset;

        switch (preset) {
            case QUALITY:
                this.entityCulling = false;
                this.particleLimiter = false;
                this.fastMathEnabled = true;
                this.smartAnimations = false;
                this.autoDefragMemory = false;
                break;
            case BALANCED:
                this.entityCulling = true;
                this.particleLimiter = true;
                this.fastMathEnabled = true;
                this.smartAnimations = true;
                this.autoDefragMemory = true;
                break;
            case HIGH_FPS:
                this.entityCulling = true;
                this.particleLimiter = true;
                this.fastMathEnabled = true;
                this.smartAnimations = true;
                this.autoDefragMemory = true;
                break;
            case ULTRA_FPS:
                this.entityCulling = true;
                this.particleLimiter = true;
                this.fastMathEnabled = true;
                this.smartAnimations = true;
                this.autoDefragMemory = true;
                break;
            case CUSTOM:
                break;
        }
        LOGGER.info("Applied performance preset: {}", preset.getDisplayName());
    }

    public void defragmentMemory() {
        long before = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / (1024 * 1024);
        System.gc();
        long after = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / (1024 * 1024);
        LOGGER.info("Memory defragmentation reclaimed {} MB (Before: {} MB, After: {} MB)", (before - after), before, after);
    }

    public PerformancePreset getActivePreset() {
        return activePreset;
    }

    public BenchmarkEngine getBenchmarkEngine() {
        return benchmarkEngine;
    }

    public boolean isEntityCulling() {
        return entityCulling;
    }

    public void setEntityCulling(boolean entityCulling) {
        this.entityCulling = entityCulling;
    }

    public boolean isParticleLimiter() {
        return particleLimiter;
    }

    public void setParticleLimiter(boolean particleLimiter) {
        this.particleLimiter = particleLimiter;
    }

    public boolean isFastMathEnabled() {
        return fastMathEnabled;
    }

    public void setFastMathEnabled(boolean fastMathEnabled) {
        this.fastMathEnabled = fastMathEnabled;
    }

    public boolean isSmartAnimations() {
        return smartAnimations;
    }

    public void setSmartAnimations(boolean smartAnimations) {
        this.smartAnimations = smartAnimations;
    }

    public boolean isAutoDefragMemory() {
        return autoDefragMemory;
    }

    public void setAutoDefragMemory(boolean autoDefragMemory) {
        this.autoDefragMemory = autoDefragMemory;
    }
}
