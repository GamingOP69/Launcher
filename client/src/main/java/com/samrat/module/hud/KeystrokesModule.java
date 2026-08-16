package com.samrat.module.hud;

import com.samrat.core.event.EventListener;
import com.samrat.core.event.events.KeyboardEvent;
import com.samrat.core.event.events.MouseEvent;
import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ColorSetting;
import com.samrat.hud.HudElement;
import com.samrat.render.RenderUtils;

public class KeystrokesModule extends Module {
    private final BooleanSetting showMouse = new BooleanSetting("Mouse Buttons", "Show LMB and RMB keys", true);
    private final BooleanSetting showSpace = new BooleanSetting("Spacebar", "Show Spacebar jump key", true);
    private final ColorSetting pressedColor = new ColorSetting("Pressed Color", "Key color when pressed", 0xFF00F0FF);

    private boolean keyW, keyA, keyS, keyD, keyLmb, keyRmb, keySpace;
    private HudElement hudElement;

    public KeystrokesModule() {
        super("Keystrokes", "Displays keyboard and mouse press overlays", Category.HUD, 0, true);
        registerSetting(showMouse);
        registerSetting(showSpace);
        registerSetting(pressedColor);
    }

    @Override
    public void onInitialize() {
        this.hudElement = new HudElement("keystrokes_hud", this, 4, 70, 74, 90) {
            @Override
            public void render(float partialTicks) {
                float startX = getPosition().getX();
                float startY = getPosition().getY();
                float scale = getPosition().getScale();

                int normalBg = getBackgroundColor().getValue();
                int activeBg = pressedColor.getValue();
                int textCol = getTextColor().getValue();

                // Key W
                drawKey("W", startX + 26 * scale, startY, 22 * scale, 22 * scale, keyW ? activeBg : normalBg, textCol);

                // Keys A, S, D
                drawKey("A", startX, startY + 24 * scale, 22 * scale, 22 * scale, keyA ? activeBg : normalBg, textCol);
                drawKey("S", startX + 26 * scale, startY + 24 * scale, 22 * scale, 22 * scale, keyS ? activeBg : normalBg, textCol);
                drawKey("D", startX + 52 * scale, startY + 24 * scale, 22 * scale, 22 * scale, keyD ? activeBg : normalBg, textCol);

                float currentY = startY + 48 * scale;

                if (showMouse.getValue()) {
                    drawKey("LMB", startX, currentY, 36 * scale, 18 * scale, keyLmb ? activeBg : normalBg, textCol);
                    drawKey("RMB", startX + 38 * scale, currentY, 36 * scale, 18 * scale, keyRmb ? activeBg : normalBg, textCol);
                    currentY += 20 * scale;
                }

                if (showSpace.getValue()) {
                    drawKey("—", startX, currentY, 74 * scale, 12 * scale, keySpace ? activeBg : normalBg, textCol);
                    currentY += 14 * scale;
                }

                getPosition().setHeight((currentY - startY) / scale);
            }
        };
    }

    private void drawKey(String label, float x, float y, float w, float h, int bg, int text) {
        RenderUtils.drawRoundedRect(x, y, x + w, y + h, 3, bg);
        RenderUtils.drawCenteredString(label, x + (w / 2), y + (h / 2) - 4, text, true);
    }

    @EventListener
    public void onKeyboard(KeyboardEvent event) {
        switch (event.getKeyCode()) {
            case 17: keyW = event.isPressed(); break; // W
            case 30: keyA = event.isPressed(); break; // A
            case 31: keyS = event.isPressed(); break; // S
            case 32: keyD = event.isPressed(); break; // D
            case 57: keySpace = event.isPressed(); break; // Space
        }
    }

    @EventListener
    public void onMouse(MouseEvent event) {
        if (event.getButton() == 0) keyLmb = event.isPressed();
        if (event.getButton() == 1) keyRmb = event.isPressed();
    }

    public HudElement getHudElement() {
        return hudElement;
    }
}
