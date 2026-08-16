package com.samrat.diagnostics;

public final class SystemInfo {
    public static String getOperatingSystem() {
        return System.getProperty("os.name") + " " + System.getProperty("os.version") + " (" + System.getProperty("os.arch") + ")";
    }

    public static String getJavaVersion() {
        return System.getProperty("java.version") + " (" + System.getProperty("java.vendor") + ") " + System.getProperty("sun.arch.data.model") + "-bit";
    }

    public static String getMemoryStats() {
        Runtime rt = Runtime.getRuntime();
        long max = rt.maxMemory() / (1024 * 1024);
        long total = rt.totalMemory() / (1024 * 1024);
        long free = rt.freeMemory() / (1024 * 1024);
        long used = total - free;
        return String.format("Used: %d MB / Allocated: %d MB / Max: %d MB", used, total, max);
    }

    public static int getAvailableProcessors() {
        return Runtime.getRuntime().availableProcessors();
    }

    private SystemInfo() {}
}
