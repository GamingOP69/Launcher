package com.samrat.module.performance;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;

public class SmartAnimationsModule extends Module {
    public SmartAnimationsModule() {
        super("Smart Animations", "Freezes animated textures (water, lava, fire) that are not currently visible on screen", Category.PERFORMANCE, 0, true);
    }
}
