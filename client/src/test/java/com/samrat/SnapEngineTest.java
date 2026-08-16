package com.samrat;

import com.samrat.hud.HudPosition;
import com.samrat.hud.SnapEngine;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class SnapEngineTest {

    @Test
    public void testLeftEdgeSnapping() {
        HudPosition pos = new HudPosition(6.0f, 100.0f, 50.0f, 20.0f);
        SnapEngine.SnapResult result = SnapEngine.computeSnap(pos, Collections.emptyList(), 800, 600);

        assertEquals(4.0f, result.snappedX, 0.001f, "Should snap magnetically to left screen edge");
        assertFalse(result.activeGuides.isEmpty());
    }

    @Test
    public void testCenterSnapping() {
        float screenW = 800;
        float targetW = 60;
        float exactCenter = (screenW - targetW) / 2.0f; // 370

        HudPosition pos = new HudPosition(373.0f, 100.0f, targetW, 20.0f);
        SnapEngine.SnapResult result = SnapEngine.computeSnap(pos, Collections.emptyList(), (int) screenW, 600);

        assertEquals(exactCenter, result.snappedX, 0.001f, "Should snap magnetically to center X");
    }
}
