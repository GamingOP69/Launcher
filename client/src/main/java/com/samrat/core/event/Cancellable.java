package com.samrat.core.event;

/**
 * Interface implemented by events that can be cancelled by listeners.
 */
public interface Cancellable {
    boolean isCancelled();
    void setCancelled(boolean cancelled);
}
