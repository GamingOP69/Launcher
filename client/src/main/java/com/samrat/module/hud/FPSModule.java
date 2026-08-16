package com.samrat.module.hud;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.TickEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ModeSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

import java.util.LinkedList;

public class FPSModule extends Module {
    private final BooleanSetting show1PercentLow = new BooleanSetting("1% Low", "Show 1% low FPS", true);
    private final BooleanSetting showFrametime = new BooleanSetting("Frametime", "Show average frametime in ms", false);
    private final ModeSetting style = new ModeSetting("Style", "Display layout style", "Standard", "Standard", "Minimal", "Bracketed");

    private int currentFps = 144;
    private int onePercentLow = 110;
    private float frameTimeMs = 6.94f;
    private final LinkedList<Integer> fpsHistory = new LinkedList<>();

    private HudElement hudElement;

    public FPSModule() {
        super("FPS", "Displays real-time frames per second and pacing", Category.HUD, 0, true);
        registerSetting(show1PercentLow);
        registerSetting(showFrametime);
        registerSetting(style);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("fps_hud", this, 4, 4, 70, 16) {
            @Override
            public void render(float partialTicks) {
                StringBuilder text = new StringBuilder();
                if (style.is("Minimal")) {
                    text.append(currentFps);
                } else if (style.is("Bracketed")) {
                    text.append("[").append(currentFps).append(" FPS]");
                } else {
                    text.append("FPS: ").append(currentFps);
                }

                if (show1PercentLow.getValue()) {
                    text.append(" (1%: ").append(onePercentLow).append(")");
                }
                if (showFrametime.getValue()) {
                    text.append(" ").append(String.format("%.1fms", frameTimeMs));
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
    public void onTick(TickEvent event) {
        if (event.getPhase() != TickEvent.Phase.END) return;
        
        // Update FPS calculations & rolling 1% lows
        fpsHistory.addLast(currentFps);
        if (fpsHistory.size() > 100) {
            fpsHistory.removeFirst();
        }

        // Calculate 1% low
        if (!fpsHistory.isEmpty()) {
            LinkedList<Integer> sorted = new LinkedList<>(fpsHistory);
            sorted.sort(Integer::compareTo);
            int lowIndex = Math.max(0, (int) (sorted.size() * 0.01));
            this.onePercentLow = sorted.get(lowIndex);
        }

        this.frameTimeMs = currentFps > 0 ? (1000.0f / currentFps) : 0.0f;
    }

    public void updateFps(int fps) {
        this.currentFps = Math.max(1, fps);
    }

    public int getCurrentFps() {
        return currentFps;
    }

    public int getOnePercentLow() {
        return onePercentLow;
    }

    public float getFrameTimeMs() {
        return frameTimeMs;
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
