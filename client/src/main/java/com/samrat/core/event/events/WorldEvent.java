package com.samrat.core.event.events;

import com.samrat.core.event.Event;

public class WorldEvent extends Event {
    public enum Type {
        LOAD, UNLOAD
    }

    private final Type type;
    private final String worldName;

    public WorldEvent(Type type, String worldName) {
        this.type = type;
        this.worldName = worldName;
    }

    public Type getType() {
        return type;
    }

    public String getWorldName() {
        return worldName;
    }
}
