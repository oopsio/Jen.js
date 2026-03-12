import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimiter } from "../api/rate-limiter.js";
describe("Rate Limiter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("should allow requests within limit", () => {
        const ip = "192.168.1.1";
        for (let i = 0; i < 10; i++) {
            expect(rateLimiter.check(ip)).toBe(true);
        }
    });
    it("should block requests exceeding limit", () => {
        const ip = "192.168.1.2";
        // First 10 allowed
        for (let i = 0; i < 10; i++) {
            expect(rateLimiter.check(ip)).toBe(true);
        }
        // 11th blocked
        expect(rateLimiter.check(ip)).toBe(false);
    });
    it("should allow different IPs independently", () => {
        const ip1 = "192.168.1.100";
        const ip2 = "192.168.1.101";
        for (let i = 0; i < 10; i++) {
            expect(rateLimiter.check(ip1)).toBe(true);
            expect(rateLimiter.check(ip2)).toBe(true);
        }
        expect(rateLimiter.check(ip1)).toBe(false);
        expect(rateLimiter.check(ip2)).toBe(false);
    });
    it("should reset limits after window expires", () => {
        vi.useFakeTimers();
        const ip = "192.168.1.200";
        // Fill limit
        for (let i = 0; i < 10; i++) {
            expect(rateLimiter.check(ip)).toBe(true);
        }
        expect(rateLimiter.check(ip)).toBe(false);
        // Advance time past window
        vi.advanceTimersByTime(61 * 1000); // 61 seconds
        // Should allow again
        expect(rateLimiter.check(ip)).toBe(true);
        vi.useRealTimers();
    });
});
