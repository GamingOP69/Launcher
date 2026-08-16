package com.samrat.performance;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * BenchmarkEngine records frame timings and calculates concrete performance metrics
 * without fabricating results.
 */
public final class BenchmarkEngine {
    private boolean running = false;
    private long benchmarkStartMs = 0;
    private int durationSeconds = 10;
    private final List<Float> frameTimesMs = new ArrayList<>();

    public static final class BenchmarkResult {
        public final double averageFps;
        public final double minFps;
        public final double onePercentLowFps;
        public final double zeroPointOnePercentLowFps;
        public final double averageFrameTimeMs;
        public final double maxFrameTimeMs;
        public final long usedMemoryMb;
        public final long maxMemoryMb;
        public final int score;

        public BenchmarkResult(double averageFps, double minFps, double onePercentLowFps, double zeroPointOnePercentLowFps,
                               double averageFrameTimeMs, double maxFrameTimeMs, long usedMemoryMb, long maxMemoryMb, int score) {
            this.averageFps = averageFps;
            this.minFps = minFps;
            this.onePercentLowFps = onePercentLowFps;
            this.zeroPointOnePercentLowFps = zeroPointOnePercentLowFps;
            this.averageFrameTimeMs = averageFrameTimeMs;
            this.maxFrameTimeMs = maxFrameTimeMs;
            this.usedMemoryMb = usedMemoryMb;
            this.maxMemoryMb = maxMemoryMb;
            this.score = score;
        }
    }

    public void startBenchmark(int durationSeconds) {
        this.durationSeconds = Math.max(3, durationSeconds);
        this.frameTimesMs.clear();
        this.benchmarkStartMs = System.currentTimeMillis();
        this.running = true;
    }

    public void recordFrame(float frameTimeMs) {
        if (!running) return;
        frameTimesMs.add(frameTimeMs);

        if ((System.currentTimeMillis() - benchmarkStartMs) >= (durationSeconds * 1000L)) {
            stopBenchmark();
        }
    }

    public void stopBenchmark() {
        this.running = false;
    }

    public BenchmarkResult computeResult() {
        if (frameTimesMs.isEmpty()) {
            return new BenchmarkResult(0, 0, 0, 0, 0, 0, 0, 0, 0);
        }

        List<Float> sortedTimes = new ArrayList<>(frameTimesMs);
        Collections.sort(sortedTimes);

        double totalTime = 0;
        for (float t : frameTimesMs) {
            totalTime += t;
        }
        double avgFrameTime = totalTime / frameTimesMs.size();
        double avgFps = avgFrameTime > 0 ? (1000.0 / avgFrameTime) : 0;

        // Worst frame times correspond to lowest FPS
        float worstFrameTime = sortedTimes.get(sortedTimes.size() - 1);
        double minFps = worstFrameTime > 0 ? (1000.0 / worstFrameTime) : 0;

        // 1% Lows (99th percentile frame time)
        int idx1 = (int) (sortedTimes.size() * 0.99);
        idx1 = Math.min(idx1, sortedTimes.size() - 1);
        double oneLow = sortedTimes.get(idx1) > 0 ? (1000.0 / sortedTimes.get(idx1)) : 0;

        // 0.1% Lows (99.9th percentile frame time)
        int idx01 = (int) (sortedTimes.size() * 0.999);
        idx01 = Math.min(idx01, sortedTimes.size() - 1);
        double zeroOneLow = sortedTimes.get(idx01) > 0 ? (1000.0 / sortedTimes.get(idx01)) : 0;

        Runtime rt = Runtime.getRuntime();
        long usedMemMb = (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
        long maxMemMb = rt.maxMemory() / (1024 * 1024);

        // Performance Score = 60% Avg FPS + 30% 1% Low + 10% 0.1% Low
        int score = (int) Math.round((avgFps * 0.60) + (oneLow * 0.30) + (zeroOneLow * 0.10));

        return new BenchmarkResult(avgFps, minFps, oneLow, zeroOneLow, avgFrameTime, worstFrameTime, usedMemMb, maxMemMb, score);
    }

    public boolean isRunning() {
        return running;
    }

    public int getRecordedFrames() {
        return frameTimesMs.size();
    }
}
