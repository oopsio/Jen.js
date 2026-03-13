/**
 * Jen.js Telemetry Client
 *
 * Collects telemetry events and sends them in batches.
 * Fire-and-forget telemetry that silently fails if endpoint unavailable.
 * Respects TELEMETRY_DISABLED environment variable.
 *
 * @example
 * ```typescript
 * const telemetry = createTelemetry('1.0.0');
 * telemetry.track({ command: 'dev', os: 'win32' });
 * // Events batched and sent automatically
 * ```
 */

import { platform } from "os";
import { log } from "../shared/log.js";

interface TelemetryEvent {
  framework: "jenjs";
  version: string;
  command?: string;
  os?: string;
  [key: string]: unknown;
}

interface TelemetryOptions {
  endpoint?: string;
  batchSize?: number;
  batchInterval?: number;
  disabled?: boolean;
}

class TelemetryClient {
  private endpoint: string;
  private batchSize: number;
  private batchInterval: number;
  private disabled: boolean;
  private queue: TelemetryEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private version: string;

  constructor(version: string, options: TelemetryOptions = {}) {
    this.version = version;
    this.endpoint =
      options.endpoint || "https://telemetry-six.vercel.app/telemetry";
    this.batchSize = options.batchSize || 50;
    this.batchInterval = options.batchInterval || 15 * 1000; // 15 seconds
    this.disabled = options.disabled || process.env.TELEMETRY_DISABLED === "1";
  }

  /**
   * Track a telemetry event.
   * Events are batched and sent automatically.
   *
   * @param event Event data to track.
   */
  track(event: Partial<TelemetryEvent>): void {
    if (this.disabled) {
      return;
    }

    const telemetryEvent: TelemetryEvent = {
      framework: "jenjs",
      version: this.version,
      os: platform(),
      ...event,
    };

    this.queue.push(telemetryEvent);

    if (process.env.DEBUG_TELEMETRY) {
      log.info(`[telemetry] Tracked: ${JSON.stringify(telemetryEvent)}`);
    }

    // Flush immediately if batch is full
    if (this.queue.length >= this.batchSize) {
      if (process.env.DEBUG_TELEMETRY) {
        log.info(`[telemetry] Batch full (${this.queue.length}), flushing`);
      }
      this.flush();
      return;
    }

    // Schedule flush if not already scheduled
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.batchInterval);
    }
  }

  /**
   * Flush pending events to server.
   * Called automatically on batch full or timer expiration.
   */
  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const events = this.queue;
    const count = events.length;
    this.queue = [];

    try {
      if (process.env.DEBUG_TELEMETRY) {
        log.info(`[telemetry] Flushing ${count} events...`);
      }
      await this.send(events);
      if (process.env.DEBUG_TELEMETRY) {
        log.info(`[telemetry] Flushed ${count} events successfully`);
      }
    } catch (error) {
      if (process.env.DEBUG_TELEMETRY) {
        log.error(
          `[telemetry] Send failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      // Silently fail - telemetry is fire-and-forget
    }
  }

  private async send(events: TelemetryEvent[]): Promise<void> {
    // Try using fetch if available (Node 18+)
    if (typeof fetch !== "undefined") {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return;
    }

    // Fallback to https module for older Node versions
    await this.sendWithHttps(events);
  }

  private async sendWithHttps(events: TelemetryEvent[]): Promise<void> {
    const https = await import("https");
    const url = new URL(this.endpoint);

    const body = JSON.stringify(events);

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      };

      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
        } else {
          resolve();
        }
        res.on("data", () => {});
      });

      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Disable telemetry collection.
   */
  disable(): void {
    this.disabled = true;
    this.queue = [];
    log.info("[telemetry] Disabled");
  }

  /**
   * Enable telemetry collection.
   */
  enable(): void {
    this.disabled = false;
    log.info("[telemetry] Enabled");
  }

  /**
   * Get current queue size.
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Check if telemetry is disabled.
   */
  isDisabled(): boolean {
    return this.disabled;
  }
}

/**
 * Create a new telemetry client.
 *
 * @param version Framework version.
 * @param options Client options.
 * @returns TelemetryClient instance.
 */
export function createTelemetry(
  version: string,
  options?: TelemetryOptions,
): TelemetryClient {
  return new TelemetryClient(version, options);
}

export type { TelemetryEvent, TelemetryOptions };
