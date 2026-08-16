package com.samrat.core.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public final class EventBus {
    private static final Logger LOGGER = LoggerFactory.getLogger(EventBus.class);

    private final Map<Class<? extends Event>, List<RegisteredInvoker>> listenerMap = new ConcurrentHashMap<>();
    private final Set<Object> registeredSubscribers = Collections.synchronizedSet(new HashSet<>());

    public void register(Object subscriber) {
        if (subscriber == null) return;
        if (registeredSubscribers.contains(subscriber)) return;

        registeredSubscribers.add(subscriber);

        for (Method method : subscriber.getClass().getDeclaredMethods()) {
            if (method.isAnnotationPresent(EventListener.class)) {
                Class<?>[] paramTypes = method.getParameterTypes();
                if (paramTypes.length == 1 && Event.class.isAssignableFrom(paramTypes[0])) {
                    @SuppressWarnings("unchecked")
                    Class<? extends Event> eventType = (Class<? extends Event>) paramTypes[0];
                    EventListener annotation = method.getAnnotation(EventListener.class);

                    method.setAccessible(true);
                    RegisteredInvoker invoker = new RegisteredInvoker(subscriber, method, annotation.priority(), annotation.ignoreCancelled());

                    List<RegisteredInvoker> invokers = listenerMap.computeIfAbsent(eventType, k -> new CopyOnWriteArrayList<>());
                    invokers.add(invoker);
                    invokers.sort(Comparator.comparingInt(inv -> inv.priority.getValue()));
                } else {
                    LOGGER.warn("Method {} in {} has @EventListener but invalid signature.",
                            method.getName(), subscriber.getClass().getName());
                }
            }
        }
    }

    public void unregister(Object subscriber) {
        if (subscriber == null || !registeredSubscribers.remove(subscriber)) {
            return;
        }

        for (List<RegisteredInvoker> invokers : listenerMap.values()) {
            invokers.removeIf(invoker -> invoker.subscriber == subscriber);
        }
    }

    public <T extends Event> T post(T event) {
        if (event == null) return null;

        List<RegisteredInvoker> invokers = listenerMap.get(event.getClass());
        if (invokers == null || invokers.isEmpty()) {
            return event;
        }

        boolean isCancellable = event instanceof Cancellable;

        for (RegisteredInvoker invoker : invokers) {
            if (isCancellable && invoker.ignoreCancelled && ((Cancellable) event).isCancelled()) {
                continue;
            }

            try {
                invoker.method.invoke(invoker.subscriber, event);
            } catch (Exception e) {
                LOGGER.error("Error dispatching event {} to {}.{}: {}",
                        event.getClass().getSimpleName(),
                        invoker.subscriber.getClass().getSimpleName(),
                        invoker.method.getName(),
                        e.getMessage(), e);
            }
        }

        return event;
    }

    public boolean isRegistered(Object subscriber) {
        return registeredSubscribers.contains(subscriber);
    }

    public void clear() {
        listenerMap.clear();
        registeredSubscribers.clear();
    }

    private static final class RegisteredInvoker {
        final Object subscriber;
        final Method method;
        final EventPriority priority;
        final boolean ignoreCancelled;

        RegisteredInvoker(Object subscriber, Method method, EventPriority priority, boolean ignoreCancelled) {
            this.subscriber = subscriber;
            this.method = method;
            this.priority = priority;
            this.ignoreCancelled = ignoreCancelled;
        }
    }
}
