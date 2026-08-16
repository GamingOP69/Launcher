package com.samrat.performance;

/**
 * Curated performance tuning presets.
 */
public enum PerformancePreset {
    QUALITY("Quality", "Maximum visual fidelity with baseline optimizations", 16, true, true, true, 2000),
    BALANCED("Balanced", "Balanced frame rate and visual polish", 12, true, false, true, 1000),
    HIGH_FPS("High FPS", "Competitive frame rates with aggressive entity and particle culling", 8, false, false, false, 500),
    ULTRA_FPS("Ultra FPS", "Maximum frames for low-end hardware and potato PCs", 6, false, false, false, 200),
    CUSTOM("Custom", "User defined custom optimization settings", 10, true, false, true, 800);

    private final String displayName;
    private final String description;
    private final int renderDistanceChunks;
    private final boolean fancyGraphics;
    private final boolean entityShadows;
    private final boolean smoothLighting;
    private final int maxParticles;

    PerformancePreset(String displayName, String description, int renderDistanceChunks, boolean fancyGraphics, boolean entityShadows, boolean smoothLighting, int maxParticles) {
        this.displayName = displayName;
        this.description = description;
        this.renderDistanceChunks = renderDistanceChunks;
        this.fancyGraphics = fancyGraphics;
        this.entityShadows = entityShadows;
        this.smoothLighting = smoothLighting;
        this.maxParticles = maxParticles;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public int getRenderDistanceChunks() {
        return renderDistanceChunks;
    }

    public boolean isFancyGraphics() {
        return fancyGraphics;
    }

    public boolean isEntityShadows() {
        return entityShadows;
    }

    public boolean isSmoothLighting() {
        return smoothLighting;
    }

    public int getMaxParticles() {
        return maxParticles;
    }
}
