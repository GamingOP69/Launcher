package com.samrat;

import com.samrat.performance.FastMath;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class FastMathTest {

    @Test
    public void testTrigonometryAccuracy() {
        for (double rad = 0; rad < Math.PI * 2; rad += 0.1) {
            float fastSin = FastMath.sin((float) rad);
            float realSin = (float) Math.sin(rad);
            assertEquals(realSin, fastSin, 0.01f, "Sin mismatch at " + rad);

            float fastCos = FastMath.cos((float) rad);
            float realCos = (float) Math.cos(rad);
            assertEquals(realCos, fastCos, 0.01f, "Cos mismatch at " + rad);
        }
    }

    @Test
    public void testRoundingAndClamping() {
        assertEquals(4, FastMath.floor(4.99));
        assertEquals(-5, FastMath.floor(-4.01));
        assertEquals(5, FastMath.ceil(4.01));
        assertEquals(10.0, FastMath.clamp(15.0, 0.0, 10.0), 0.001);
        assertEquals(0.0, FastMath.clamp(-5.0, 0.0, 10.0), 0.001);
    }
}
