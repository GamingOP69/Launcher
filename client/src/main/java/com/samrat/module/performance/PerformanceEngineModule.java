package com.samrat.module.performance;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.ModeSetting;
import com.samrat.performance.PerformancePreset;

public class PerformanceEngineModule extends Module {
    private final ModeSetting preset = new ModeSetting("Preset", "Active performance tuning profile", "Balanced", "Quality", "Balanced", "High FPS", "Ultra FPS", "Custom");

    public PerformanceEngineModule() {
        super("Performance Engine", "Master optimization engine with frametime smoothing", Category.PERFORMANCE, 0, true);
        registerSetting(preset);
    }

    public PerformancePreset getSelectedPreset() {
        switch (preset.getValue().toUpperCase().replace(" ", "_")) {
            case "QUALITY": return PerformancePreset.QUALITY;
            case "HIGH_FPS": return PerformancePreset.HIGH_FPS;
            case "ULTRA_FPS": return PerformancePreset.ULTRA_FPS;
            case "CUSTOM": return PerformancePreset.CUSTOM;
            default: return PerformancePreset.BALANCED;
        }
    }
}
