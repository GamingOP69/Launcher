package com.samrat.core.event.events;

import com.samrat.core.event.Event;

public class ScreenCloseEvent extends Event {
    private final Object screen;

    public ScreenCloseEvent(Object screen) {
        this.screen = screen;
    }

    public Object getScreen() {
        return screen;
    }
}
