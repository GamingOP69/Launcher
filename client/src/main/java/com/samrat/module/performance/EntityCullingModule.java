package com.samrat.module.performance;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.NumberSetting;

public class EntityCullingModule extends Module {
    private final NumberSetting maxDistance = new NumberSetting("Max Distance", "Maximum entity render distance in blocks", 48.0, 16.0, 96.0, 4.0, "m");

    public EntityCullingModule() {
        super("Entity Culling", "Skips rendering of non-visible or occluded entities", Category.PERFORMANCE, 0, true);
        registerSetting(maxDistance);
    }

    public double getMaxDistance() {
        return maxDistance.getValue();
    }
}
