package com.samrat.module.misc;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ColorSetting;
import com.samrat.core.setting.NumberSetting;

public class CustomScoreboardModule extends Module {
    private final BooleanSetting hideRedNumbers = new BooleanSetting("Hide Red Numbers", "Hides red sidebar scoreboard point numbers", true);
    private final BooleanSetting transparentBackground = new BooleanSetting("Transparent BG", "Removes dark scoreboard background box", false);
    private final BooleanSetting textShadow = new BooleanSetting("Text Shadow", "Renders sharp font shadows on scoreboard lines", true);
    private final NumberSetting yOffset = new NumberSetting("Y Offset", "Vertical offset position on screen", 0.0, -100.0, 100.0, 5.0);

    public CustomScoreboardModule() {
        super("Custom Scoreboard", "Customizes sidebar scoreboard styling, numbers, and background", Category.MISC, 0, true);
        registerSetting(hideRedNumbers);
        registerSetting(transparentBackground);
        registerSetting(textShadow);
        registerSetting(yOffset);
    }

    public boolean isHideRedNumbers() {
        return hideRedNumbers.getValue();
    }

    public boolean isTransparentBackground() {
        return transparentBackground.getValue();
    }

    public boolean isTextShadow() {
        return textShadow.getValue();
    }

    public float getYOffset() {
        return yOffset.getFloatValue();
    }
}
