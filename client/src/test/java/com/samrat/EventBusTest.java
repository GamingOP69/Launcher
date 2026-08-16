package com.samrat;

import com.samrat.core.event.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EventBusTest {
    private EventBus eventBus;

    public static class TestEvent extends Event {
        public final String data;
        public TestEvent(String data) {
            this.data = data;
        }
    }

    public static class CancellableTestEvent extends Event implements Cancellable {
        private boolean cancelled = false;

        @Override
        public boolean isCancelled() {
            return cancelled;
        }

        @Override
        public void setCancelled(boolean cancelled) {
            this.cancelled = cancelled;
        }
    }

    @BeforeEach
    public void setup() {
        eventBus = new EventBus();
    }

    @Test
    public void testEventDispatch() {
        List<String> received = new ArrayList<>();
        Object subscriber = new Object() {
            @EventListener
            public void onTest(TestEvent e) {
                received.add(e.data);
            }
        };

        eventBus.register(subscriber);
        eventBus.post(new TestEvent("Hello Samrat"));

        assertEquals(1, received.size());
        assertEquals("Hello Samrat", received.get(0));

        eventBus.unregister(subscriber);
        eventBus.post(new TestEvent("Second Call"));
        assertEquals(1, received.size());
    }

    @Test
    public void testPriorityOrdering() {
        List<String> callOrder = new ArrayList<>();
        Object subscriber = new Object() {
            @EventListener(priority = EventPriority.LOW)
            public void onLow(TestEvent e) {
                callOrder.add("LOW");
            }

            @EventListener(priority = EventPriority.HIGHEST)
            public void onHighest(TestEvent e) {
                callOrder.add("HIGHEST");
            }

            @EventListener(priority = EventPriority.NORMAL)
            public void onNormal(TestEvent e) {
                callOrder.add("NORMAL");
            }
        };

        eventBus.register(subscriber);
        eventBus.post(new TestEvent("Priority Check"));

        assertEquals(3, callOrder.size());
        assertEquals("HIGHEST", callOrder.get(0));
        assertEquals("NORMAL", callOrder.get(1));
        assertEquals("LOW", callOrder.get(2));
    }

    @Test
    public void testCancellation() {
        List<String> executed = new ArrayList<>();
        Object subscriber = new Object() {
            @EventListener(priority = EventPriority.HIGHEST)
            public void onFirst(CancellableTestEvent e) {
                executed.add("FIRST");
                e.setCancelled(true);
            }

            @EventListener(priority = EventPriority.NORMAL, ignoreCancelled = true)
            public void onIgnored(CancellableTestEvent e) {
                executed.add("IGNORED");
            }

            @EventListener(priority = EventPriority.MONITOR, ignoreCancelled = false)
            public void onMonitor(CancellableTestEvent e) {
                executed.add("MONITOR");
            }
        };

        eventBus.register(subscriber);
        CancellableTestEvent evt = new CancellableTestEvent();
        eventBus.post(evt);

        assertTrue(evt.isCancelled());
        assertEquals(2, executed.size());
        assertEquals("FIRST", executed.get(0));
        assertEquals("MONITOR", executed.get(1));
    }
}
