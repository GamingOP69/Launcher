package com.samrat.module.bedwars;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

public class BedwarsHUDModule extends Module {
    private final BooleanSetting showKills = new BooleanSetting("Kills", "Show total kills", true);
    private final BooleanSetting showIronCount = new BooleanSetting("Iron / Gold Counter", "Show held resource amounts", true);

    private int kills = 7;
    private int ironCount = 48;
    private int goldCount = 12;
    private HudElement hudElement;

    public BedwarsHUDModule() {
        super("Bedwars Overlay", "Displays essential Bedwars game statistics in one compact HUD", Category.BEDWARS, 0, false);
        registerSetting(showKills);
        registerSetting(showIronCount);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("bedwars_combined_hud", this, 300, 230, 95, 36) {
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

                RenderUtils.drawString("Kills: " + kills, startX + 4 * scale, startY + 4 * scale, ColorPalette.TEXT_PRIMARY, true);
                if (showIronCount.getValue()) {
                    String res = "Fe: " + ironCount + " | Au: " + goldCount;
                    RenderUtils.drawString(res, startX + 4 * scale, startY + 18 * scale, ColorPalette.ACCENT_SILVER, true);
                }
            }
        };
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
