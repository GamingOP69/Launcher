package com.samrat.hud;

import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ColorSetting;
import com.samrat.core.setting.NumberSetting;

public abstract class HudElement {
    private final String id;
    private final Module module;
    private final HudPosition position;

    // Common HUD customizability settings
    private final BooleanSetting showBackground;
    private final ColorSetting backgroundColor;
    private final ColorSetting textColor;
    private final ColorSetting accentColor;
    private final NumberSetting scaleSetting;

    public HudElement(String id, Module module, float defaultX, float defaultY, float defaultWidth, float defaultHeight) {
        this.id = id;
        this.module = module;
        this.position = new HudPosition(defaultX, defaultY, defaultWidth, defaultHeight, 1.0f);

        this.showBackground = new BooleanSetting("Background", "Draw background panel", true);
        this.backgroundColor = new ColorSetting("BG Color", "HUD background color", 0x800C1017, true);
        this.textColor = new ColorSetting("Text Color", "HUD primary text color", 0xFFFFFFFF);
        this.accentColor = new ColorSetting("Accent Color", "HUD accent highlight color", 0xFF00F0FF);
        this.scaleSetting = new NumberSetting("Scale", "Element scale multiplier", 1.0, 0.5, 2.0, 0.05);

        this.scaleSetting.addChangeListener(val -> position.setScale(val.floatValue()));

        if (module != null) {
            module.registerSetting(showBackground);
            module.registerSetting(backgroundColor);
            module.registerSetting(textColor);
            module.registerSetting(accentColor);
            module.registerSetting(scaleSetting);
        }
    }

    public abstract void render(float partialTicks);

    public void renderEditor(boolean isSelected, float partialTicks) {
        render(partialTicks);
    }

    public boolean isVisible() {
        return module == null || module.isEnabled();
    }

    public boolean isHovered(int mouseX, int mouseY) {
        float x = position.getX();
        float y = position.getY();
        float w = position.getWidth() * position.getScale();
        float h = position.getHeight() * position.getScale();
        return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
    }

    public String getId() {
        return id;
    }

    public Module getModule() {
        return module;
    }

    public HudPosition getPosition() {
        return position;
    }

    public BooleanSetting getShowBackground() {
        return showBackground;
    }

    public ColorSetting getBackgroundColor() {
        return backgroundColor;
    }

    public ColorSetting getTextColor() {
        return textColor;
    }

    public ColorSetting getAccentColor() {
        return accentColor;
    }

    public NumberSetting getScaleSetting() {
        return scaleSetting;
    }
}
