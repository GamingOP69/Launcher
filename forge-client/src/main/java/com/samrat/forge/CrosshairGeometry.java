package com.samrat.forge;

/** Geometry for a static, visual-only replacement crosshair. */
final class CrosshairGeometry {
    static final int COLOR = 0xFFFFFFFF;
    private static final int ARM_LENGTH = 5;
    private static final int CENTER_GAP = 3;
    private static final int THICKNESS = 2;

    private CrosshairGeometry() {
    }

    static int[][] create(int width, int height) {
        if (width <= 0 || height <= 0) {
            return new int[0][0];
        }

        int centerX = width / 2;
        int centerY = height / 2;
        int half = THICKNESS / 2;
        return new int[][] {
                { centerX - half, centerY - CENTER_GAP - ARM_LENGTH,
                        centerX - half + THICKNESS, centerY - CENTER_GAP },
                { centerX - CENTER_GAP - ARM_LENGTH, centerY - half,
                        centerX - CENTER_GAP, centerY - half + THICKNESS },
                { centerX + CENTER_GAP, centerY - half,
                        centerX + CENTER_GAP + ARM_LENGTH, centerY - half + THICKNESS },
                { centerX - half, centerY + CENTER_GAP,
                        centerX - half + THICKNESS, centerY + CENTER_GAP + ARM_LENGTH }
        };
    }
}
