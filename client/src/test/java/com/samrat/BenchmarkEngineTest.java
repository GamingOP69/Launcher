package com.samrat;

import com.samrat.performance.BenchmarkEngine;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class BenchmarkEngineTest {

    @Test
    public void testBenchmarkMetricComputation() {
        BenchmarkEngine engine = new BenchmarkEngine();
        engine.startBenchmark(1);

        // Simulate 100 frames at ~6.94ms (144 FPS) with occasional stutter at 20ms
        for (int i = 0; i < 98; i++) {
            engine.recordFrame(6.94f);
        }
        engine.recordFrame(15.0f);
        engine.recordFrame(25.0f);

        engine.stopBenchmark();
        assertEquals(100, engine.getRecordedFrames());

        BenchmarkEngine.BenchmarkResult result = engine.computeResult();
        assertTrue(result.averageFps > 100.0, "Average FPS should be above 100");
        assertTrue(result.minFps <= 50.0, "Min FPS should reflect worst frame time");
        assertTrue(result.onePercentLowFps > 0, "1% Lows should be calculated");
        assertTrue(result.score > 0, "Benchmark score should be positive");
    }
}
