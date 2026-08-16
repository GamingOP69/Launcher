package com.samrat.core.event.events;

import com.samrat.core.event.Cancellable;
import com.samrat.core.event.Event;

public class ScreenOpenEvent extends Event implements Cancellable {
    private final Object screen;
    private boolean cancelled = false;

    public ScreenOpenEvent(Object screen) {
        this.screen = screen;
    }

    public Object getScreen() {
        return screen;
    }

    @Override
    public boolean isCancelled() {
        return cancelled;
    }

    @Override
    public void setCancelled(boolean cancelled) {
        this.cancelled = cancelled;
    }
}
