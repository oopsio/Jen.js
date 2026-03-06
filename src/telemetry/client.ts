/**
 * Jen.js Telemetry Client
 *
 * Collects telemetry events and sends them in batches.
 * Usage:
 *   telemetry.track({ command: 'dev', os: 'win32' });
 *   // Events are sent automatically every 15 seconds or when batch is full
 */

import { platform } from "os";

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
      options.endpoint || "https://jenjs-telemetry.vercel.app/telemetry";
    this.batchSize = options.batchSize || 50;
    this.batchInterval = options.batchInterval || 15 * 1000; // 15 seconds
    this.disabled =
      options.disabled || process.env.TELEMETRY_DISABLED === "1";
  }

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

    // Flush immediately if batch is full
    if (this.queue.length >= this.batchSize) {
      this.flush();
      return;
    }

    // Schedule flush if not already scheduled
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.batchInterval);
    }
  }

  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const events = this.queue;
    this.queue = [];

    try {
      await this.send(events);
    } catch (error) {
      if (process.env.DEBUG_TELEMETRY) {
        console.error("Telemetry send failed:", error);
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

  disable(): void {
    this.disabled = true;
    this.queue = [];
  }

  enable(): void {
    this.disabled = false;
  }
}

// Export factory function
export function createTelemetry(
  version: string,
  options?: TelemetryOptions
): TelemetryClient {
  return new TelemetryClient(version, options);
}

export type { TelemetryEvent, TelemetryOptions };
