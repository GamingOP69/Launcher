package com.samrat.module.pvp;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.AttackEntityEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

public class ReachDisplayModule extends Module {
    private double lastReach = 2.95;
    private HudElement hudElement;

    public ReachDisplayModule() {
        super("Reach Display", "Displays the distance of your last attack hit", Category.PVP, 0, false);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("reach_display_hud", this, 200, 24, 70, 18) {
            @Override
            public void render(float partialTicks) {
                String text = String.format("Reach: %.2fb", lastReach);
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

    @EventListener
    public void onAttack(AttackEntityEvent event) {
        this.lastReach = Math.min(6.0, Math.max(0.0, event.getDistance()));
    }

    public double getLastReach() {
        return lastReach;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
