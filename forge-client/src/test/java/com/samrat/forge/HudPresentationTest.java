package com.samrat.forge;

import org.junit.Test;

import static org.junit.Assert.assertArrayEquals;

public class HudPresentationTest {
    @Test
    public void formatsInformationalGameStateAndPressedKeys() {
        assertArrayEquals(new String[] {
                "FPS: 120",
                "XYZ: -12, 64, 8",
                "Facing: NORTH",
                "Movement: [W] A S D  [SPACE]",
                "Sprint: ON"
        }, HudPresentation.create(120, -12, 64, 8, "NORTH",
                true, false, false, false, true, true));
    }

    @Test
    public void clampsNegativeFpsAndHandlesMissingFacing() {
        assertArrayEquals(new String[] {
                "FPS: 0",
                "XYZ: 0, 0, 0",
                "Facing: UNKNOWN",
                "Movement: W A S D  SPACE",
                "Sprint: OFF"
        }, HudPresentation.create(-1, 0, 0, 0, null,
                false, false, false, false, false, false));
    }
}
