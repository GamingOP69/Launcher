package com.samrat.module.hud;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ModeSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

public class CoordsModule extends Module {
    private final BooleanSetting showNether = new BooleanSetting("Nether Coords", "Show Nether/Overworld conversion", true);
    private final BooleanSetting showBiome = new BooleanSetting("Biome", "Show current biome name", true);
    private final ModeSetting format = new ModeSetting("Format", "Coordinate display format", "XYZ Line", "XYZ Line", "Multi-Line");

    private double posX = 124.5;
    private double posY = 64.0;
    private double posZ = -820.3;
    private String biome = "Plains";

    private HudElement hudElement;

    public CoordsModule() {
        super("Coordinates", "Displays player position, Nether conversion and Biome", Category.HUD, 0, true);
        registerSetting(showNether);
        registerSetting(showBiome);
        registerSetting(format);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("coords_hud", this, 4, 300, 150, 18) {
            @Override
            public void render(float partialTicks) {
                float startX = getPosition().getX();
                float startY = getPosition().getY();
                float scale = getPosition().getScale();

                String coordStr = String.format("XYZ: %.1f / %.1f / %.1f", posX, posY, posZ);
                if (showNether.getValue()) {
                    coordStr += String.format(" [Nether: %.1f, %.1f]", posX / 8.0, posZ / 8.0);
                }
                if (showBiome.getValue()) {
                    coordStr += " (" + biome + ")";
                }

                getPosition().setWidth(RenderUtils.getStringWidth(coordStr) + 8);

                if (getShowBackground().getValue()) {
                    RenderUtils.drawRoundedRect(startX, startY,
                            startX + getPosition().getWidth() * scale,
                            startY + getPosition().getHeight() * scale,
                            4, getBackgroundColor().getValue());
                }

                RenderUtils.drawString(coordStr, startX + 4 * scale, startY + 4 * scale, getTextColor().getValue(), true);
            }
        };
    }

    public void updatePosition(double x, double y, double z, String biomeName) {
        this.posX = x;
        this.posY = y;
        this.posZ = z;
        this.biome = biomeName;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
