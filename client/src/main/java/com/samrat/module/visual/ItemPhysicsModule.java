package com.samrat.module.visual;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.NumberSetting;

public class ItemPhysicsModule extends Module {
    private final NumberSetting rotationSpeed = new NumberSetting("Rotation Speed", "Item ground rotation animation speed", 1.0, 0.2, 3.0, 0.1);

    public ItemPhysicsModule() {
        super("Item Physics", "Renders dropped items flat on the ground with realistic physics", Category.VISUAL, 0, true);
        registerSetting(rotationSpeed);
    }

    public float getRotationSpeed() {
        return rotationSpeed.getFloatValue();
    }
}
