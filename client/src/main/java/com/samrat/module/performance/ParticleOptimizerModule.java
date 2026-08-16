package com.samrat.module.performance;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.NumberSetting;

public class ParticleOptimizerModule extends Module {
    private final NumberSetting maxParticles = new NumberSetting("Particle Limit", "Maximum simultaneous active particles", 800, 100, 4000, 100);

    public ParticleOptimizerModule() {
        super("Particle Optimizer", "Limits excess particle rendering to preserve high framerates", Category.PERFORMANCE, 0, true);
        registerSetting(maxParticles);
    }

    public int getMaxParticles() {
        return maxParticles.getIntValue();
    }
}
