package com.samrat.module.hud;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

import java.util.ArrayList;
import java.util.List;

public class PotionStatusModule extends Module {
    private final BooleanSetting showBlinking = new BooleanSetting("Blink Low", "Blink text when effect has < 10s left", true);

    private final List<PotionEffectData> activeEffects = new ArrayList<>();
    private HudElement hudElement;

    public static final class PotionEffectData {
        public final String name;
        public final int amplifier;
        public final int remainingSeconds;

        public PotionEffectData(String name, int amplifier, int remainingSeconds) {
            this.name = name;
            this.amplifier = amplifier;
            this.remainingSeconds = remainingSeconds;
        }
    }

    public PotionStatusModule() {
        super("Potion Status", "Displays active potion effects and countdown timers", Category.HUD, 0, true);
        registerSetting(showBlinking);

        // Default mock effects for HUD design & preview
        activeEffects.add(new PotionEffectData("Speed", 2, 94));
        activeEffects.add(new PotionEffectData("Strength", 1, 42));
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("potion_status_hud", this, 4, 250, 85, 40) {
            @Override
            public void render(float partialTicks) {
                if (activeEffects.isEmpty()) return;

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
                for (PotionEffectData effect : activeEffects) {
                    int mins = effect.remainingSeconds / 60;
                    int secs = effect.remainingSeconds % 60;
                    String timeStr = String.format("%d:%02d", mins, secs);
                    String label = effect.name + " " + effect.amplifier + " (" + timeStr + ")";

                    int textColor = (showBlinking.getValue() && effect.remainingSeconds < 10 && (System.currentTimeMillis() / 400) % 2 == 0)
                            ? ColorPalette.STATUS_DANGER : getTextColor().getValue();

                    RenderUtils.drawString(label, startX + 4 * scale, currentY, textColor, true);
                    currentY += 16 * scale;
                }

                getPosition().setHeight(Math.max(20, (currentY - startY) / scale));
            }
        };
    }

    public List<PotionEffectData> getActiveEffects() {
        return activeEffects;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
