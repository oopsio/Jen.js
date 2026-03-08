import type { IncomingMessage, ServerResponse } from "node:http";
import { log } from "../shared/log.js";

/**
 * Lifecycle manager for graceful shutdown of the HTTP server.
 * Tracks active requests and ensures they complete before closing.
 * Handles signal interrupts (SIGTERM, SIGINT) gracefully.
 */
export class GracefulShutdown {
  private activeRequests = new Set<IncomingMessage>();
  private isShuttingDown = false;
  private shutdownTimeout = 30000; // 30s timeout for graceful shutdown
  private signalHandlers: NodeJS.SignalsListener[] = [];

  /**
   * Tracks an incoming request.
   * Call this when a request begins.
   */
  trackRequest(req: IncomingMessage) {
    this.activeRequests.add(req);
  }

  /**
   * Untrack a request when it completes.
   * Call this when a request ends.
   */
  releaseRequest(req: IncomingMessage) {
    this.activeRequests.delete(req);
  }

  /**
   * Get the count of active requests still in flight.
   */
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Check if shutdown is in progress.
   */
  isShuttingDown_(): boolean {
    return this.isShuttingDown;
  }

  /**
   * Wait for all active requests to complete, with timeout.
   * Useful before closing server resources.
   *
   * @returns Promise that resolves when all requests complete or timeout
   */
  async waitForActiveRequests(): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 100; // ms

    return new Promise<void>((resolve) => {
      const poll = () => {
        if (this.activeRequests.size === 0) {
          log.info(
            `[Graceful Shutdown] All ${this.activeRequests.size} requests completed`,
          );
          resolve();
          return;
        }

        const elapsed = Date.now() - startTime;
        if (elapsed > this.shutdownTimeout) {
          log.warn(
            `[Graceful Shutdown] Timeout after ${elapsed}ms with ${this.activeRequests.size} requests still active`,
          );
          resolve();
          return;
        }

        setTimeout(poll, pollInterval);
      };

      poll();
    });
  }

  /**
   * Handle shutdown signal (SIGTERM or SIGINT).
   * Prevents accepting new requests and waits for in-flight ones.
   *
   * @param signal Signal name that was received
   * @param onClose Callback to execute when ready to close server
   */
  async handleShutdownSignal(
    signal: string,
    onClose: () => Promise<void>,
  ): Promise<void> {
    if (this.isShuttingDown) {
      log.warn(`[Graceful Shutdown] Already shutting down, ignoring ${signal}`);
      return;
    }

    this.isShuttingDown = true;
    log.warn(
      `[Graceful Shutdown] ${signal} received, starting graceful shutdown`,
    );
    log.info(
      `[Graceful Shutdown] ${this.activeRequests.size} active request(s)`,
    );

    // Wait for active requests to complete
    await this.waitForActiveRequests();

    // Close server resources
    log.info("[Graceful Shutdown] Closing server resources");
    await onClose();

    log.info("[Graceful Shutdown] Clean shutdown complete");
  }

  /**
   * Register signal handlers for graceful shutdown.
   * Handles SIGTERM and SIGINT.
   *
   * @param onClose Callback to execute when closing resources
   */
  registerSignalHandlers(onClose: () => Promise<void>) {
    const handleSignal = async (signal: string) => {
      await this.handleShutdownSignal(signal, onClose);
      process.exit(0);
    };

    // Handle both SIGTERM (terminate) and SIGINT (Ctrl+C)
    process.on("SIGTERM", () => handleSignal("SIGTERM"));
    process.on("SIGINT", () => handleSignal("SIGINT"));

    log.info("[Graceful Shutdown] Signal handlers registered");
  }

  /**
   * Clean up signal handlers.
   * Useful for cleanup in tests or when you need to unregister.
   */
  unregisterSignalHandlers() {
    process.removeAllListeners("SIGTERM");
    process.removeAllListeners("SIGINT");
  }

  /**
   * Set the timeout for graceful shutdown (in milliseconds).
   * Default is 30s.
   *
   * @param timeoutMs Timeout in milliseconds
   */
  setShutdownTimeout(timeoutMs: number) {
    this.shutdownTimeout = timeoutMs;
  }
}

export default GracefulShutdown;
