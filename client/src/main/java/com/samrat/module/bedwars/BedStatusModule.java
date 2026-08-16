package com.samrat.module.bedwars;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ModeSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.ColorPalette;
import com.samrat.render.RenderUtils;

import java.util.LinkedHashMap;
import java.util.Map;

public class BedStatusModule extends Module {
    public enum BedState {
        ALIVE("✓", ColorPalette.STATUS_SUCCESS),
        BROKEN("1", ColorPalette.STATUS_WARNING),
        ELIMINATED("✗", ColorPalette.STATUS_DANGER);

        public final String icon;
        public final int color;

        BedState(String icon, int color) {
            this.icon = icon;
            this.color = color;
        }
    }

    private final ModeSetting layout = new ModeSetting("Layout", "Matrix orientation", "Vertical", "Vertical", "Compact Grid");
    private final BooleanSetting showMyTeamFirst = new BooleanSetting("My Team Top", "Pin own team to top of list", true);

    private final Map<String, BedState> teamBeds = new LinkedHashMap<>();
    private HudElement hudElement;

    public BedStatusModule() {
        super("Bed Status", "Displays 8-team bed status matrix in Bedwars", Category.BEDWARS, 0, true);
        registerSetting(layout);
        registerSetting(showMyTeamFirst);

        // Default 8 teams state
        teamBeds.put("Red", BedState.ALIVE);
        teamBeds.put("Blue", BedState.ALIVE);
        teamBeds.put("Green", BedState.BROKEN);
        teamBeds.put("Yellow", BedState.ALIVE);
        teamBeds.put("Aqua", BedState.ELIMINATED);
        teamBeds.put("White", BedState.ALIVE);
        teamBeds.put("Pink", BedState.BROKEN);
        teamBeds.put("Gray", BedState.ELIMINATED);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("bed_status_hud", this, 300, 4, 85, 140) {
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

                RenderUtils.drawString("Bedwars", startX + 4 * scale, startY + 4 * scale, getAccentColor().getValue(), true);

                float currentY = startY + 16 * scale;
                for (Map.Entry<String, BedState> entry : teamBeds.entrySet()) {
                    String team = entry.getKey();
                    BedState state = entry.getValue();

                    String line = team + ": " + state.icon;
                    RenderUtils.drawString(line, startX + 6 * scale, currentY, state.color, true);
                    currentY += 14 * scale;
                }
            }
        };
    }

    public void setTeamBedState(String team, BedState state) {
        if (teamBeds.containsKey(team)) {
            teamBeds.put(team, state);
        }
    }

    public Map<String, BedState> getTeamBeds() {
        return teamBeds;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
