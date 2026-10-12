package com.samrat.forge;

/** Pure formatting for the small, informational in-game HUD. */
final class HudPresentation {
    private HudPresentation() {
    }

    static String[] create(int fps, int x, int y, int z, String facing,
                           boolean forward, boolean left, boolean back, boolean right,
                           boolean jump, boolean sprinting) {
        return new String[] {
                "FPS: " + Math.max(0, fps),
                "XYZ: " + x + ", " + y + ", " + z,
                "Facing: " + (facing == null ? "UNKNOWN" : facing),
                "Movement: " + key("W", forward) + " " + key("A", left) + " "
                        + key("S", back) + " " + key("D", right) + "  " + key("SPACE", jump),
                "Sprint: " + (sprinting ? "ON" : "OFF")
        };
    }

    private static String key(String label, boolean pressed) {
        return pressed ? "[" + label + "]" : label;
    }
}
