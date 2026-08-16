package com.samrat.module.bedwars;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

public class TeamStatusModule extends Module {
    private final BooleanSetting showFinalKills = new BooleanSetting("Final Kills", "Track final kills during match", true);

    private int finalKills = 4;
    private int bedsBroken = 2;
    private HudElement hudElement;

    public TeamStatusModule() {
        super("Team Status", "Tracks active players, final kills and broken beds", Category.BEDWARS, 0, true);
        registerSetting(showFinalKills);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("team_status_hud", this, 300, 150, 85, 34) {
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

                RenderUtils.drawString("Finals: " + finalKills, startX + 4 * scale, startY + 4 * scale, getTextColor().getValue(), true);
                RenderUtils.drawString("Beds: " + bedsBroken, startX + 4 * scale, startY + 18 * scale, getAccentColor().getValue(), true);
            }
        };
    }

    public void incrementFinalKills() {
        this.finalKills++;
    }

    public void incrementBedsBroken() {
        this.bedsBroken++;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
