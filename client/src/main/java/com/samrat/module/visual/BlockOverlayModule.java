package com.samrat.module.visual;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;
import com.samrat.core.setting.ColorSetting;
import com.samrat.core.setting.NumberSetting;

public class BlockOverlayModule extends Module {
    private final ColorSetting outlineColor = new ColorSetting("Outline Color", "Block highlight outline color", 0xFF00F0FF);
    private final ColorSetting fillColor = new ColorSetting("Fill Color", "Block fill color", 0x3300F0FF, true);
    private final BooleanSetting showFill = new BooleanSetting("Fill Block", "Draw translucent filled box", true);
    private final NumberSetting lineWidth = new NumberSetting("Line Width", "Outline line thickness", 2.0, 1.0, 5.0, 0.5);

    public BlockOverlayModule() {
        super("Block Overlay", "Customizes block selection bounding box outline and fill", Category.VISUAL, 0, true);
        registerSetting(outlineColor);
        registerSetting(fillColor);
        registerSetting(showFill);
        registerSetting(lineWidth);
    }

    public ColorSetting getOutlineColor() {
        return outlineColor;
    }

    public ColorSetting getFillColor() {
        return fillColor;
    }

    public BooleanSetting getShowFill() {
        return showFill;
    }

    public NumberSetting getLineWidth() {
        return lineWidth;
    }
}
