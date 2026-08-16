package com.samrat.module.hud;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.MouseEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

import java.util.ArrayList;
import java.util.List;

public class CPSModule extends Module {
    private final BooleanSetting showRightClick = new BooleanSetting("Right CPS", "Show Right Click CPS", true);
    private final BooleanSetting showPrefix = new BooleanSetting("Show Prefix", "Prefix with LMB/RMB", true);

    private final List<Long> leftClicks = new ArrayList<>();
    private final List<Long> rightClicks = new ArrayList<>();

    private HudElement hudElement;

    public CPSModule() {
        super("CPS", "Displays Left and Right clicks per second", Category.HUD, 0, true);
        registerSetting(showRightClick);
        registerSetting(showPrefix);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("cps_hud", this, 4, 24, 75, 16) {
            @Override
            public void render(float partialTicks) {
                int lCps = getLeftCps();
                int rCps = getRightCps();

                StringBuilder text = new StringBuilder();
                if (showPrefix.getValue()) {
                    text.append("LMB: ").append(lCps);
                    if (showRightClick.getValue()) {
                        text.append(" | RMB: ").append(rCps);
                    }
                } else {
                    text.append(lCps).append(" CPS");
                    if (showRightClick.getValue()) {
                        text.append(" | ").append(rCps).append(" CPS");
                    }
                }

                String rendered = text.toString();
                getPosition().setWidth(RenderUtils.getStringWidth(rendered) + 8);

                if (getShowBackground().getValue()) {
                    RenderUtils.drawRoundedRect(getPosition().getX(), getPosition().getY(),
                            getPosition().getX() + getPosition().getWidth() * getPosition().getScale(),
                            getPosition().getY() + getPosition().getHeight() * getPosition().getScale(),
                            4, getBackgroundColor().getValue());
                }

                RenderUtils.drawString(rendered, getPosition().getX() + 4, getPosition().getY() + 4, getTextColor().getValue(), true);
            }
        };
    }

    @EventListener
    public void onMouse(MouseEvent event) {
        if (!event.isPressed()) return;

        long now = System.currentTimeMillis();
        if (event.getButton() == 0) { // LMB
            leftClicks.add(now);
        } else if (event.getButton() == 1) { // RMB
            rightClicks.add(now);
        }
    }

    public int getLeftCps() {
        cleanOldClicks();
        return leftClicks.size();
    }

    public int getRightCps() {
        cleanOldClicks();
        return rightClicks.size();
    }

    private void cleanOldClicks() {
        long threshold = System.currentTimeMillis() - 1000;
        leftClicks.removeIf(time -> time < threshold);
        rightClicks.removeIf(time -> time < threshold);
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
