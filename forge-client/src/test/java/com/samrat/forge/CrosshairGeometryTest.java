package com.samrat.forge;

import org.junit.Test;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

public class CrosshairGeometryTest {
    @Test
    public void centersFourArmsAroundTheScreenCenter() {
        int[][] actual = CrosshairGeometry.create(800, 600);
        assertEquals(4, actual.length);
        assertArrayEquals(new int[] { 399, 292, 401, 297 }, actual[0]);
        assertArrayEquals(new int[] { 392, 299, 397, 301 }, actual[1]);
        assertArrayEquals(new int[] { 403, 299, 408, 301 }, actual[2]);
        assertArrayEquals(new int[] { 399, 303, 401, 308 }, actual[3]);
    }

    @Test
    public void handlesOddDimensionsWithoutMovingTheCenterGap() {
        int[][] rects = CrosshairGeometry.create(801, 601);
        assertEquals(4, rects.length);
        assertEquals(399, rects[0][0]);
        assertEquals(297, rects[0][3]);
        assertEquals(303, rects[3][1]);
    }

    @Test
    public void ignoresUnavailableOverlayDimensions() {
        assertEquals(0, CrosshairGeometry.create(0, 600).length);
        assertEquals(0, CrosshairGeometry.create(800, -1).length);
    }
}
