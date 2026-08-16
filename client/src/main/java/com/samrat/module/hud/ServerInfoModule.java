package com.samrat.module.hud;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

public class ServerInfoModule extends Module {
    private final BooleanSetting showIp = new BooleanSetting("Server IP", "Show current server address", true);
    private final BooleanSetting showTps = new BooleanSetting("Estimated TPS", "Show estimated ticks per second", true);

    private String serverIp = "mc.hypixel.net";
    private float estimatedTps = 20.0f;
    private HudElement hudElement;

    public ServerInfoModule() {
        super("Server Info", "Displays connected server address and TPS", Category.HUD, 0, true);
        registerSetting(showIp);
        registerSetting(showTps);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("server_info_hud", this, 4, 350, 110, 18) {
            @Override
            public void render(float partialTicks) {
                StringBuilder text = new StringBuilder();
                if (showIp.getValue()) {
                    text.append(serverIp);
                }
                if (showTps.getValue()) {
                    if (text.length() > 0) text.append(" | ");
                    text.append(String.format("TPS: %.1f", estimatedTps));
                }

                String rendered = text.toString();
                getPosition().setWidth(RenderUtils.getStringWidth(rendered) + 8);
                float startX = getPosition().getX();
                float startY = getPosition().getY();
                float scale = getPosition().getScale();

                if (getShowBackground().getValue()) {
                    RenderUtils.drawRoundedRect(startX, startY,
                            startX + getPosition().getWidth() * scale,
                            startY + getPosition().getHeight() * scale,
                            4, getBackgroundColor().getValue());
                }

                RenderUtils.drawString(rendered, startX + 4 * scale, startY + 4 * scale, getTextColor().getValue(), true);
            }
        };
    }

    public void setServerInfo(String ip, float tps) {
        this.serverIp = ip != null ? ip : "Singleplayer";
        this.estimatedTps = Math.max(0.0f, Math.min(20.0f, tps));
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
