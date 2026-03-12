/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */
export class PerformanceMonitor {
    fps = [];
    renderTimes = [];
    updateCount = 0;
    startTime = performance.now();
    maxMetrics = 60; // Keep 60 data points
    start() {
        // Monitor performance periodically
        setInterval(() => {
            this.recordMetrics();
        }, 1000);
    }
    recordFPS(fps) {
        this.fps.push(fps);
        if (this.fps.length > this.maxMetrics) {
            this.fps.shift();
        }
    }
    recordRenderTime(duration) {
        this.renderTimes.push(duration);
        if (this.renderTimes.length > this.maxMetrics) {
            this.renderTimes.shift();
        }
    }
    recordUpdate() {
        this.updateCount++;
    }
    recordMetrics() {
        // Record memory usage if available
        const memory = performance.memory;
        if (memory) {
            // Memory is in bytes, convert to MB
            const memoryMb = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            return {
                fps: [...this.fps],
                renderTime: [...this.renderTimes],
                updateCount: this.updateCount,
                memoryUsage: memoryMb,
                timestamp: performance.now() - this.startTime,
            };
        }
    }
    getMetrics() {
        const memory = performance.memory;
        const memoryMb = memory
            ? Math.round(memory.usedJSHeapSize / 1024 / 1024)
            : 0;
        return {
            fps: [...this.fps],
            renderTime: [...this.renderTimes],
            updateCount: this.updateCount,
            memoryUsage: memoryMb,
            timestamp: performance.now() - this.startTime,
        };
    }
    getAverageFPS() {
        if (this.fps.length === 0)
            return 0;
        return Math.round(this.fps.reduce((a, b) => a + b, 0) / this.fps.length);
    }
    getAverageRenderTime() {
        if (this.renderTimes.length === 0)
            return 0;
        return Math.round(this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length);
    }
    getLastFPS() {
        return this.fps.length > 0 ? this.fps[this.fps.length - 1] : 0;
    }
    getLastRenderTime() {
        return this.renderTimes.length > 0
            ? this.renderTimes[this.renderTimes.length - 1]
            : 0;
    }
    reset() {
        this.fps = [];
        this.renderTimes = [];
        this.updateCount = 0;
        this.startTime = performance.now();
    }
}
