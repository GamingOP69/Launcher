package com.samrat.core.module;

public enum Category {
    PERFORMANCE("Performance", "FPS boosts, entity culling & memory optimization"),
    HUD("HUD", "Heads-Up Display informational overlays"),
    PVP("PvP", "Combat information, hit indicators & utilities"),
    BEDWARS("Bedwars", "Bed destruction alerts, team status & resource timers"),
    VISUAL("Visual", "Graphics, cosmetics & view enhancements"),
    PLAYER("Player", "Movement indicators, freelook & chat tools"),
    WORLD("World", "Time changer, environment overlays"),
    MISC("Misc", "General utilities and diagnostics");

    private final String displayName;
    private final String description;

    Category(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
