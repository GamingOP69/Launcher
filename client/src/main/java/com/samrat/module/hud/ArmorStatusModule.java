package com.samrat.module.hud;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ModeSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

public class ArmorStatusModule extends Module {
    private final ModeSetting displayMode = new ModeSetting("Display", "Durability format", "Percentage", "Percentage", "Exact", "Bar Only");
    private final BooleanSetting showHeldItem = new BooleanSetting("Held Item", "Show mainhand item durability", true);

    private HudElement hudElement;

    public ArmorStatusModule() {
        super("Armor Status", "Displays armor equipment and durability levels", Category.HUD, 0, true);
        registerSetting(displayMode);
        registerSetting(showHeldItem);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("armor_status_hud", this, 4, 170, 70, 75) {
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

                String[] pieces = {"Helmet", "Chest", "Legs", "Boots"};
                int[] durabilities = {92, 78, 64, 45};

                float yOffset = startY + 4 * scale;
                for (int i = 0; i < pieces.length; i++) {
                    String label = pieces[i] + ": " + durabilities[i] + "%";
                    int color = durabilities[i] > 50 ? ColorPalette.TEXT_PRIMARY : (durabilities[i] > 20 ? ColorPalette.STATUS_WARNING : ColorPalette.STATUS_DANGER);
                    RenderUtils.drawString(label, startX + 4 * scale, yOffset, color, true);
                    yOffset += 16 * scale;
                }
            }
        };
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
