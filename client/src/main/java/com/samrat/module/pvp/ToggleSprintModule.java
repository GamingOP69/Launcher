package com.samrat.module.pvp;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ModeSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

public class ToggleSprintModule extends Module {
    private final BooleanSetting showHudText = new BooleanSetting("HUD Indicator", "Display sprint/sneak status on screen", true);
    private final ModeSetting textStyle = new ModeSetting("Text Style", "Indicator text format", "[Sprinting (Toggled)]", "[Sprinting (Toggled)]", "Sprinting", "SPRINT (ON)");

    private boolean sprintToggled = true;
    private HudElement hudElement;

    public ToggleSprintModule() {
        super("Toggle Sprint", "Allows automatic continuous sprinting without holding key", Category.PVP, 0, true);
        registerSetting(showHudText);
        registerSetting(textStyle);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("togglesprint_hud", this, 4, 400, 110, 16) {
            @Override
            public void render(float partialTicks) {
                if (!showHudText.getValue()) return;

                String text = textStyle.getValue();
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

    public boolean isSprintToggled() {
        return isEnabled() && sprintToggled;
    }

    public void setSprintToggled(boolean sprintToggled) {
        this.sprintToggled = sprintToggled;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
