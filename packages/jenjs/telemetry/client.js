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
class TelemetryClient {
    endpoint;
    batchSize;
    batchInterval;
    disabled;
    queue = [];
    flushTimer = null;
    version;
    constructor(version, options = {}) {
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
    track(event) {
        if (this.disabled) {
            return;
        }
        const telemetryEvent = {
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
    async flush() {
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
        }
        catch (error) {
            if (process.env.DEBUG_TELEMETRY) {
                log.error(`[telemetry] Send failed: ${error instanceof Error ? error.message : String(error)}`);
            }
            // Silently fail - telemetry is fire-and-forget
        }
    }
    async send(events) {
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
    async sendWithHttps(events) {
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
                }
                else {
                    resolve();
                }
                res.on("data", () => { });
            });
            req.on("error", reject);
            req.write(body);
            req.end();
        });
    }
    /**
     * Disable telemetry collection.
     */
    disable() {
        this.disabled = true;
        this.queue = [];
        log.info("[telemetry] Disabled");
    }
    /**
     * Enable telemetry collection.
     */
    enable() {
        this.disabled = false;
        log.info("[telemetry] Enabled");
    }
    /**
     * Get current queue size.
     */
    getQueueSize() {
        return this.queue.length;
    }
    /**
     * Check if telemetry is disabled.
     */
    isDisabled() {
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
export function createTelemetry(version, options) {
    return new TelemetryClient(version, options);
}
