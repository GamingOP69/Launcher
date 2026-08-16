package com.samrat.module.visual;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.NumberSetting;

public class MotionBlurModule extends Module {
    private final NumberSetting blurAmount = new NumberSetting("Amount", "Motion blur intensity level", 3.0, 1.0, 7.0, 0.5);

    public MotionBlurModule() {
        super("Motion Blur", "Applies subtle velocity-based cinematic motion blur", Category.VISUAL, 0, false);
        registerSetting(blurAmount);
    }

    public float getBlurAmount() {
        return blurAmount.getFloatValue();
    }
}
