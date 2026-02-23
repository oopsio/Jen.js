/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */

export interface PerformanceMetrics {
  fps: number[];
  renderTime: number[];
  updateCount: number;
  memoryUsage: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private fps: number[] = [];
  private renderTimes: number[] = [];
  private updateCount = 0;
  private startTime = performance.now();
  private maxMetrics = 60; // Keep 60 data points

  start() {
    // Monitor performance periodically
    setInterval(() => {
      this.recordMetrics();
    }, 1000);
  }

  recordFPS(fps: number) {
    this.fps.push(fps);
    if (this.fps.length > this.maxMetrics) {
      this.fps.shift();
    }
  }

  recordRenderTime(duration: number) {
    this.renderTimes.push(duration);
    if (this.renderTimes.length > this.maxMetrics) {
      this.renderTimes.shift();
    }
  }

  recordUpdate() {
    this.updateCount++;
  }

  private recordMetrics() {
    // Record memory usage if available
    if (performance.memory) {
      // Memory is in bytes, convert to MB
      const memoryMb = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      return {
        fps: [...this.fps],
        renderTime: [...this.renderTimes],
        updateCount: this.updateCount,
        memoryUsage: memoryMb,
        timestamp: performance.now() - this.startTime,
      };
    }
  }

  getMetrics(): PerformanceMetrics {
    const memoryMb = performance.memory
      ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
      : 0;

    return {
      fps: [...this.fps],
      renderTime: [...this.renderTimes],
      updateCount: this.updateCount,
      memoryUsage: memoryMb,
      timestamp: performance.now() - this.startTime,
    };
  }

  getAverageFPS(): number {
    if (this.fps.length === 0) return 0;
    return Math.round(this.fps.reduce((a, b) => a + b, 0) / this.fps.length);
  }

  getAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0;
    return Math.round(
      this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length
    );
  }

  getLastFPS(): number {
    return this.fps.length > 0 ? this.fps[this.fps.length - 1] : 0;
  }

  getLastRenderTime(): number {
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
