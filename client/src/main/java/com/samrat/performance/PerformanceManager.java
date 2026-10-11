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
                break;
            case BALANCED:
                this.entityCulling = true;
                this.particleLimiter = true;
                this.fastMathEnabled = true;
                this.smartAnimations = true;
                break;
            case HIGH_FPS:
                this.entityCulling = true;
                this.particleLimiter = true;
                this.fastMathEnabled = true;
                this.smartAnimations = true;
                break;
            case ULTRA_FPS:
                this.entityCulling = true;
                this.particleLimiter = true;
                this.fastMathEnabled = true;
                this.smartAnimations = true;
                break;
            case CUSTOM:
                break;
        }
        LOGGER.info("Applied performance preset: {}", preset.getDisplayName());
    }

    public void reportMemoryUsage() {
        Runtime runtime = Runtime.getRuntime();
        long used = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);
        LOGGER.info("Current JVM heap usage: {} MB (committed: {} MB, maximum: {} MB)",
                used, runtime.totalMemory() / (1024 * 1024), runtime.maxMemory() / (1024 * 1024));
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

}
