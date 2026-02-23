/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Rate limiting middleware that protects against brute force and DDoS attacks.
 * Tracks request count per client IP within a time window and rejects excess requests.
 * Uses in-memory storage, suitable for single-server deployments; use Redis for distributed systems.
 *
 * Automatically cleans up expired records every minute to prevent memory leaks.
 * Respects X-Forwarded-For header for deployments behind a proxy or load balancer.
 *
 * @param options Rate limiting configuration.
 * @param options.windowMs Time window in milliseconds (default: 15 minutes).
 * @param options.max Maximum requests per IP per window (default: 100).
 * @param options.message Error message sent to rate-limited clients (default: "Too many requests...").
 * @param options.statusCode HTTP status for rate-limited responses (default: 429 Too Many Requests).
 * @returns Middleware function.
 *
 * @example
 * kernel.use(rateLimit({
 *   windowMs: 15 * 60 * 1000,
 *   max: 100
 * }));
 */
export function rateLimit(options = {}) {
    const defaults = {
        windowMs: 15 * 60 * 1000, // 15 minutes.
        max: 100, // 100 requests per window.
        message: "Too many requests, please try again later.",
        statusCode: 429,
    };
    const opts = { ...defaults, ...options };
    // In-memory store mapping IP addresses to request records.
    const hits = new Map();
    // Cleanup old records every minute to prevent memory leak.
    // Records outside their window are garbage collected.
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of hits.entries()) {
            if (now > record.resetTime) {
                hits.delete(key);
            }
        }
    }, 60 * 1000);
    return async (ctx, next) => {
        // Extract the client IP address. Check X-Forwarded-For header for proxied requests.
        let ip = ctx.req.headers["x-forwarded-for"];
        if (typeof ip === "string") {
            ip = ip.split(",")[0].trim(); // Get first IP if multiple are listed.
        }
        else {
            ip = ctx.req.socket.remoteAddress || "unknown";
        }
        const now = Date.now();
        let record = hits.get(ip);
        // Initialize or reset the request record if the window has expired.
        if (!record || now > record.resetTime) {
            record = {
                count: 0,
                resetTime: now + opts.windowMs,
                firstRequest: now,
            };
            hits.set(ip, record);
        }
        record.count++;
        const remaining = opts.max - record.count;
        // Set standard rate-limit headers following GitHub API conventions.
        ctx.response.header("RateLimit-Limit", opts.max);
        ctx.response.header("RateLimit-Remaining", Math.max(0, remaining));
        ctx.response.header("RateLimit-Reset", Math.ceil(record.resetTime / 1000));
        if (record.count > opts.max) {
            // Rate limit exceeded. Respond with retry-after header and error message.
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            ctx.response.header("Retry-After", retryAfter);
            ctx.response.status(opts.statusCode).json({
                error: opts.message,
                retryAfter,
            });
            return;
        }
        await next();
    };
}
