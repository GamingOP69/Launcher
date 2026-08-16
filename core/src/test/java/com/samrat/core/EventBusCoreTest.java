package com.samrat.core;

import com.samrat.core.event.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EventBusCoreTest {
    private EventBus eventBus;

    public static class SimpleCoreEvent extends Event {
        public final String payload;
        public SimpleCoreEvent(String payload) {
            this.payload = payload;
        }
    }

    @BeforeEach
    public void setup() {
        eventBus = new EventBus();
    }

    @Test
    public void testCoreEventBusRegistrationAndDispatch() {
        List<String> list = new ArrayList<>();
        Object sub = new Object() {
            @EventListener
            public void onEvent(SimpleCoreEvent e) {
                list.add(e.payload);
            }
        };

        eventBus.register(sub);
        assertTrue(eventBus.isRegistered(sub));

        eventBus.post(new SimpleCoreEvent("Core Bus OK"));
        assertEquals(1, list.size());
        assertEquals("Core Bus OK", list.get(0));

        eventBus.unregister(sub);
        assertFalse(eventBus.isRegistered(sub));
    }
}
