package com.samrat.module.pvp;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.ColorSetting;
import com.samrat.core.setting.NumberSetting;

public class HitColorModule extends Module {
    private final ColorSetting hitColor = new ColorSetting("Damage Color", "Color overlay when entities take damage", 0x80FF0000, true);
    private final NumberSetting fadeSpeed = new NumberSetting("Fade Speed", "Speed of damage color fade", 1.0, 0.2, 3.0, 0.1);

    public HitColorModule() {
        super("Hit Color", "Customizes the damage flash color of hurt entities", Category.PVP, 0, false);
        registerSetting(hitColor);
        registerSetting(fadeSpeed);
    }

    public int getHitColorRgba() {
        return hitColor.getValue();
    }

    public float getRed() {
        return hitColor.getRed() / 255.0f;
    }

    public float getGreen() {
        return hitColor.getGreen() / 255.0f;
    }

    public float getBlue() {
        return hitColor.getBlue() / 255.0f;
    }

    public float getAlpha() {
        return hitColor.getAlpha() / 255.0f;
    }
}
