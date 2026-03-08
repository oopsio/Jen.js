import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GracefulShutdown } from "../src/core/lifecycle.ts";
import { IncomingMessage } from "node:http";
import { EventEmitter } from "node:events";

describe("GracefulShutdown", () => {
  let shutdown: GracefulShutdown;

  beforeEach(() => {
    shutdown = new GracefulShutdown();
    shutdown.setShutdownTimeout(1000); // 1s timeout for tests
  });

  afterEach(() => {
    shutdown.unregisterSignalHandlers();
  });

  it("should track and release requests", () => {
    const req = new EventEmitter() as IncomingMessage;

    expect(shutdown.getActiveRequestCount()).toBe(0);

    shutdown.trackRequest(req);
    expect(shutdown.getActiveRequestCount()).toBe(1);

    shutdown.releaseRequest(req);
    expect(shutdown.getActiveRequestCount()).toBe(0);
  });

  it("should handle multiple active requests", () => {
    const req1 = new EventEmitter() as IncomingMessage;
    const req2 = new EventEmitter() as IncomingMessage;
    const req3 = new EventEmitter() as IncomingMessage;

    shutdown.trackRequest(req1);
    shutdown.trackRequest(req2);
    shutdown.trackRequest(req3);
    expect(shutdown.getActiveRequestCount()).toBe(3);

    shutdown.releaseRequest(req1);
    expect(shutdown.getActiveRequestCount()).toBe(2);

    shutdown.releaseRequest(req2);
    shutdown.releaseRequest(req3);
    expect(shutdown.getActiveRequestCount()).toBe(0);
  });

  it("should detect shutdown in progress", () => {
    expect(shutdown.isShuttingDown_()).toBe(false);
  });

  it("should wait for requests to complete", async () => {
    const req = new EventEmitter() as IncomingMessage;
    shutdown.trackRequest(req);

    let waitComplete = false;
    const waitPromise = shutdown.waitForActiveRequests().then(() => {
      waitComplete = true;
    });

    // Give it a moment to start waiting
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(waitComplete).toBe(false);

    // Release the request
    shutdown.releaseRequest(req);

    // Wait for completion
    await waitPromise;
    expect(waitComplete).toBe(true);
  });

  it("should timeout waiting for requests", async () => {
    const req = new EventEmitter() as IncomingMessage;
    shutdown.trackRequest(req);
    shutdown.setShutdownTimeout(100); // 100ms timeout

    const startTime = Date.now();
    await shutdown.waitForActiveRequests();
    const elapsed = Date.now() - startTime;

    // Should have timed out (roughly)
    expect(elapsed).toBeGreaterThanOrEqual(100);
    expect(elapsed).toBeLessThan(500); // Allow some variance

    // Request should still be tracked (not auto-released)
    expect(shutdown.getActiveRequestCount()).toBe(1);
  });

  it("should handle shutdown signal", async () => {
    const onCloseSpy = vi.fn().mockResolvedValue(undefined);

    const req = new EventEmitter() as IncomingMessage;
    shutdown.trackRequest(req);

    let signalHandled = false;
    const signalPromise = shutdown
      .handleShutdownSignal("SIGTERM", onCloseSpy)
      .then(() => {
        signalHandled = true;
      });

    // Give it a moment
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Signal should not be marked as handled yet (waiting for requests)
    expect(signalHandled).toBe(false);

    // Release the request
    shutdown.releaseRequest(req);

    // Wait for signal handler
    await signalPromise;
    expect(signalHandled).toBe(true);
    expect(onCloseSpy).toHaveBeenCalled();
  });

  it("should prevent accepting new requests during shutdown", async () => {
    const onClose = vi.fn().mockResolvedValue(undefined);
    const req = new EventEmitter() as IncomingMessage;

    shutdown.trackRequest(req);

    let signalHandled = false;
    const signalPromise = shutdown
      .handleShutdownSignal("SIGINT", onClose)
      .then(() => {
        signalHandled = true;
      });

    // During shutdown
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(shutdown.isShuttingDown_()).toBe(true);

    // Try to create a new request during shutdown
    const newReq = new EventEmitter() as IncomingMessage;
    shutdown.trackRequest(newReq); // Should still accept but log warning

    shutdown.releaseRequest(req);
    shutdown.releaseRequest(newReq);

    await signalPromise;
    expect(signalHandled).toBe(true);
  });

  it("should ignore duplicate shutdown signals", async () => {
    const onClose = vi.fn().mockResolvedValue(undefined);
    const req = new EventEmitter() as IncomingMessage;

    shutdown.trackRequest(req);

    // Start first signal
    const firstSignal = shutdown.handleShutdownSignal("SIGTERM", onClose);

    // Immediately try another signal
    await new Promise((resolve) => setTimeout(resolve, 10));
    const secondSignal = shutdown.handleShutdownSignal("SIGINT", onClose);

    shutdown.releaseRequest(req);

    await Promise.all([firstSignal, secondSignal]);

    // onClose should be called only once
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
