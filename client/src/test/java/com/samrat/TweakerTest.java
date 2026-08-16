package com.samrat;

import com.samrat.core.tweaker.SamratTransformer;
import com.samrat.core.tweaker.SamratTweaker;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class TweakerTest {

    @Test
    public void testTweakerLaunchArguments() {
        SamratTweaker tweaker = new SamratTweaker();
        tweaker.acceptOptions(Collections.singletonList("--demo"), new File("."), new File("./assets"), "1.8.9");

        assertEquals("net.minecraft.client.main.Main", tweaker.getLaunchTarget());
        assertEquals("1.8.9", tweaker.getVersion());
        assertTrue(tweaker.getLaunchArguments().length > 0);
        assertEquals("--demo", tweaker.getLaunchArguments()[0]);
    }

    @Test
    public void testTransformerEventBridge() {
        // Verify transformer methods run safely without throwing exceptions
        assertDoesNotThrow(() -> {
            SamratTransformer.onTickStart();
            SamratTransformer.onTickEnd();
            SamratTransformer.onRender2D(1.0f, 1920, 1080);
            SamratTransformer.onKeyInput(54, ' ', true);
        });
    }
}
