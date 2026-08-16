package com.samrat.core.event;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a method as an event handler that can be subscribed to the EventBus.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface EventListener {
    EventPriority priority() default EventPriority.NORMAL;
    boolean ignoreCancelled() default false;
}
