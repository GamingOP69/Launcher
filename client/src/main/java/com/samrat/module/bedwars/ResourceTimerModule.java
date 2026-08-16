package com.samrat.module.bedwars;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.TickEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

public class ResourceTimerModule extends Module {
    private final BooleanSetting showDiamonds = new BooleanSetting("Diamond Tier", "Countdown to next Diamond tier upgrade", true);
    private final BooleanSetting showEmeralds = new BooleanSetting("Emerald Tier", "Countdown to next Emerald tier upgrade", true);

    private int diamondTier = 2;
    private int diamondCountdownSec = 145;
    private int emeraldTier = 1;
    private int emeraldCountdownSec = 85;

    private HudElement hudElement;

    public ResourceTimerModule() {
        super("Resource Timers", "Displays countdowns for Diamond and Emerald generator tiers", Category.BEDWARS, 0, true);
        registerSetting(showDiamonds);
        registerSetting(showEmeralds);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("resource_timer_hud", this, 300, 190, 95, 34) {
            @Override
            public void render(float partialTicks) {
                float startX = getPosition().getX();
                float startY = getPosition().getY();
                float scale = getPosition().getScale();

                if (getShowBackground().getValue()) {
                    RenderUtils.drawRoundedRect(startX, startY,
                            startX + getPosition().getWidth() * scale,
                            startY + getPosition().getHeight() * scale,
                            4, getBackgroundColor().getValue());
                }

                float currentY = startY + 4 * scale;
                if (showDiamonds.getValue()) {
                    String dText = String.format("Diamond %d in %02d:%02d", diamondTier, diamondCountdownSec / 60, diamondCountdownSec % 60);
                    RenderUtils.drawString(dText, startX + 4 * scale, currentY, ColorPalette.PRIMARY_CYAN, true);
                    currentY += 14 * scale;
                }

                if (showEmeralds.getValue()) {
                    String eText = String.format("Emerald %d in %02d:%02d", emeraldTier, emeraldCountdownSec / 60, emeraldCountdownSec % 60);
                    RenderUtils.drawString(eText, startX + 4 * scale, currentY, ColorPalette.STATUS_SUCCESS, true);
                    currentY += 14 * scale;
                }

                getPosition().setHeight(Math.max(18, (currentY - startY) / scale));
            }
        };
    }

    @EventListener
    public void onTick(TickEvent event) {
        if (event.getPhase() != TickEvent.Phase.END) return;
        if (event.getTickCount() % 20 == 0) { // Every 1 second (20 ticks)
            if (diamondCountdownSec > 0) diamondCountdownSec--;
            if (emeraldCountdownSec > 0) emeraldCountdownSec--;
        }
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
