package com.samrat.module.hud;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

public class PingModule extends Module {
    private final BooleanSetting colorCode = new BooleanSetting("Dynamic Color", "Color code ping based on latency", true);

    private int ping = 28; // ms
    private HudElement hudElement;

    public PingModule() {
        super("Ping", "Displays connection latency to the server", Category.HUD, 0, true);
        registerSetting(colorCode);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("ping_hud", this, 4, 44, 60, 16) {
            @Override
            public void render(float partialTicks) {
                String text = ping + " ms";
                getPosition().setWidth(RenderUtils.getStringWidth(text) + 8);

                if (getShowBackground().getValue()) {
                    RenderUtils.drawRoundedRect(getPosition().getX(), getPosition().getY(),
                            getPosition().getX() + getPosition().getWidth() * getPosition().getScale(),
                            getPosition().getY() + getPosition().getHeight() * getPosition().getScale(),
                            4, getBackgroundColor().getValue());
                }

                int textColor = getTextColor().getValue();
                if (colorCode.getValue()) {
                    if (ping < 50) {
                        textColor = ColorPalette.STATUS_SUCCESS;
                    } else if (ping < 120) {
                        textColor = ColorPalette.STATUS_WARNING;
                    } else {
                        textColor = ColorPalette.STATUS_DANGER;
                    }
                }

                RenderUtils.drawString(text, getPosition().getX() + 4, getPosition().getY() + 4, textColor, true);
            }
        };
    }

    public void setPing(int ping) {
        this.ping = Math.max(0, ping);
    }

    public int getPing() {
        return ping;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
