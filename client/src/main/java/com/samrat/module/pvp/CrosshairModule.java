package com.samrat.module.pvp;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ColorSetting;
import com.samrat.core.setting.ModeSetting;
import com.samrat.core.setting.NumberSetting;
import com.samrat.render.RenderUtils;

public class CrosshairModule extends Module {
    private final ModeSetting style = new ModeSetting("Style", "Crosshair geometry style", "Classic Cross", "Classic Cross", "Dot Only", "Circle", "T-Shape");
    private final ColorSetting color = new ColorSetting("Color", "Crosshair color", 0xFF00F0FF);
    private final NumberSetting size = new NumberSetting("Size", "Length of crosshair lines", 5.0, 1.0, 15.0, 0.5);
    private final NumberSetting thickness = new NumberSetting("Thickness", "Line thickness", 1.5, 0.5, 4.0, 0.5);
    private final NumberSetting gap = new NumberSetting("Gap", "Center gap spacing", 3.0, 0.0, 10.0, 0.5);
    private final BooleanSetting centerDot = new BooleanSetting("Center Dot", "Draw center dot pixel", true);
    private final BooleanSetting dynamicSpread = new BooleanSetting("Dynamic Spread", "Expands slightly during movement", false);

    public CrosshairModule() {
        super("Crosshair", "Customizable high-visibility aiming crosshairs", Category.PVP, 0, true);
        registerSetting(style);
        registerSetting(color);
        registerSetting(size);
        registerSetting(thickness);
        registerSetting(gap);
        registerSetting(centerDot);
        registerSetting(dynamicSpread);
    }

    public void renderCustomCrosshair(int screenWidth, int screenHeight, boolean isMoving) {
        float centerX = screenWidth / 2.0f;
        float centerY = screenHeight / 2.0f;

        float s = size.getFloatValue();
        float t = thickness.getFloatValue();
        float g = gap.getFloatValue() + (dynamicSpread.getValue() && isMoving ? 2.0f : 0.0f);
        int col = color.getValue();

        if (centerDot.getValue()) {
            RenderUtils.drawRect(centerX - t / 2, centerY - t / 2, centerX + t / 2, centerY + t / 2, col);
        }

        if (style.is("Classic Cross") || style.is("T-Shape")) {
            // Left
            RenderUtils.drawRect(centerX - g - s, centerY - t / 2, centerX - g, centerY + t / 2, col);
            // Right
            RenderUtils.drawRect(centerX + g, centerY - t / 2, centerX + g + s, centerY + t / 2, col);
            // Bottom
            RenderUtils.drawRect(centerX - t / 2, centerY + g, centerX + t / 2, centerY + g + s, col);
            // Top (only if not T-Shape)
            if (!style.is("T-Shape")) {
                RenderUtils.drawRect(centerX - t / 2, centerY - g - s, centerX + t / 2, centerY - g, col);
            }
        }
    }
}
