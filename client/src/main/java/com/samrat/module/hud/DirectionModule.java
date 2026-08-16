package com.samrat.module.hud;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

public class DirectionModule extends Module {
    private final BooleanSetting showAngles = new BooleanSetting("Show Angles", "Show exact Yaw and Pitch values", true);

    private float yaw = 45.0f;
    private float pitch = 0.0f;
    private HudElement hudElement;

    public DirectionModule() {
        super("Direction", "Displays compass heading and facing angles", Category.HUD, 0, true);
        registerSetting(showAngles);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("direction_hud", this, 4, 325, 110, 18) {
            @Override
            public void render(float partialTicks) {
                String heading = getHeadingFromYaw(yaw);
                String text = "Facing: " + heading;
                if (showAngles.getValue()) {
                    text += String.format(" (%.1f / %.1f)", yaw, pitch);
                }

                getPosition().setWidth(RenderUtils.getStringWidth(text) + 8);
                float startX = getPosition().getX();
                float startY = getPosition().getY();
                float scale = getPosition().getScale();

                if (getShowBackground().getValue()) {
                    RenderUtils.drawRoundedRect(startX, startY,
                            startX + getPosition().getWidth() * scale,
                            startY + getPosition().getHeight() * scale,
                            4, getBackgroundColor().getValue());
                }

                RenderUtils.drawString(text, startX + 4 * scale, startY + 4 * scale, getTextColor().getValue(), true);
            }
        };
    }

    public static String getHeadingFromYaw(float yaw) {
        float normalized = (yaw % 360 + 360) % 360;
        if (normalized >= 337.5 || normalized < 22.5) return "South";
        if (normalized < 67.5) return "South-West";
        if (normalized < 112.5) return "West";
        if (normalized < 157.5) return "North-West";
        if (normalized < 202.5) return "North";
        if (normalized < 247.5) return "North-East";
        if (normalized < 292.5) return "East";
        return "South-East";
    }

    public void updateAngles(float yaw, float pitch) {
        this.yaw = yaw;
        this.pitch = pitch;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
