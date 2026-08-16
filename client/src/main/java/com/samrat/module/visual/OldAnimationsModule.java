package com.samrat.module.visual;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;
import com.samrat.core.setting.BooleanSetting;

/**
 * Recreates classic Minecraft 1.7 animations in 1.8.9 (Block-hitting, sword swing, rod, bow, eating).
 */
public final class OldAnimationsModule extends Module {
    private final BooleanSetting blockHit;
    private final BooleanSetting swordSwing;
    private final BooleanSetting rodThrow;
    private final BooleanSetting bowDraw;
    private final BooleanSetting consumeFood;

    public OldAnimationsModule() {
        super("1.7 Old Animations", "Recreates classic Minecraft 1.7 block-hitting and combat animations in 1.8.9", Category.VISUAL);
        this.blockHit = new BooleanSetting("1.7 Blockhit", "Classic 1.7 simultaneous sword block and swing animation", true);
        this.swordSwing = new BooleanSetting("1.7 Sword Swing", "Original smooth 1.7 weapon swing motion", true);
        this.rodThrow = new BooleanSetting("1.7 Fishing Rod", "Recreates original fishing rod casting posture", true);
        this.bowDraw = new BooleanSetting("1.7 Bow Draw", "Classic centered bow drawing animation", true);
        this.consumeFood = new BooleanSetting("1.7 Eating & Drinking", "Classic food consumption motion", true);

        registerSettings(blockHit, swordSwing, rodThrow, bowDraw, consumeFood);
        setEnabled(true);
    }

    public boolean isBlockHit() {
        return blockHit.getValue();
    }

    public boolean isSwordSwing() {
        return swordSwing.getValue();
    }

    public boolean isRodThrow() {
        return rodThrow.getValue();
    }

    public boolean isBowDraw() {
        return bowDraw.getValue();
    }

    public boolean isConsumeFood() {
        return consumeFood.getValue();
    }
}
