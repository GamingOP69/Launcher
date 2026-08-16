package com.samrat.module.pvp;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.AttackEntityEvent;
import com.samrat.core.event.events.TickEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.NumberSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

public class ComboCounterModule extends Module {
    private final NumberSetting resetTimeoutSec = new NumberSetting("Reset Timeout", "Seconds without hit before combo resets", 2.0, 0.5, 5.0, 0.1, "s");

    private int comboCount = 0;
    private long lastHitTime = 0;
    private HudElement hudElement;

    public ComboCounterModule() {
        super("Combo Counter", "Displays current melee attack streak", Category.PVP, 0, true);
        registerSetting(resetTimeoutSec);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("combo_counter_hud", this, 200, 4, 70, 18) {
            @Override
            public void render(float partialTicks) {
                String text = comboCount > 0 ? (comboCount + " Combo") : "No Combo";
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
        this.comboCount++;
        this.lastHitTime = System.currentTimeMillis();
    }

    @EventListener
    public void onTick(TickEvent event) {
        if (event.getPhase() != TickEvent.Phase.END) return;

        if (comboCount > 0 && (System.currentTimeMillis() - lastHitTime) > (resetTimeoutSec.getValue() * 1000)) {
            comboCount = 0;
        }
    }

    public int getComboCount() {
        return comboCount;
    }

    public void resetCombo() {
        this.comboCount = 0;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
