package com.samrat.core.event;

public interface Cancellable {
    boolean isCancelled();
    void setCancelled(boolean cancelled);
}
