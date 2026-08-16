package com.samrat.module.hud;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ModeSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

import java.text.SimpleDateFormat;
import java.util.Date;

public class ClockModule extends Module {
    private final ModeSetting format = new ModeSetting("Time Format", "12-hour or 24-hour clock", "12-Hour", "12-Hour", "24-Hour");
    private final BooleanSetting showSession = new BooleanSetting("Session Time", "Show current game session duration", true);

    private final long sessionStartTime = System.currentTimeMillis();
    private HudElement hudElement;

    public ClockModule() {
        super("Clock", "Displays real-world time and session playtime", Category.HUD, 0, true);
        registerSetting(format);
        registerSetting(showSession);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("clock_hud", this, 4, 375, 120, 18) {
            @Override
            public void render(float partialTicks) {
                SimpleDateFormat sdf = format.is("24-Hour") ? new SimpleDateFormat("HH:mm:ss") : new SimpleDateFormat("hh:mm:ss a");
                String timeStr = sdf.format(new Date());

                StringBuilder text = new StringBuilder(timeStr);
                if (showSession.getValue()) {
                    long elapsedSec = (System.currentTimeMillis() - sessionStartTime) / 1000;
                    long hours = elapsedSec / 3600;
                    long mins = (elapsedSec % 3600) / 60;
                    long secs = elapsedSec % 60;
                    text.append(String.format(" [%02d:%02d:%02d]", hours, mins, secs));
                }

                String rendered = text.toString();
                getPosition().setWidth(RenderUtils.getStringWidth(rendered) + 8);
                float startX = getPosition().getX();
                float startY = getPosition().getY();
                float scale = getPosition().getScale();

                if (getShowBackground().getValue()) {
                    RenderUtils.drawRoundedRect(startX, startY,
                            startX + getPosition().getWidth() * scale,
                            startY + getPosition().getHeight() * scale,
                            4, getBackgroundColor().getValue());
                }

                RenderUtils.drawString(rendered, startX + 4 * scale, startY + 4 * scale, getTextColor().getValue(), true);
            }
        };
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
