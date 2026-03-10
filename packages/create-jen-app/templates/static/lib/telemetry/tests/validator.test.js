import { describe, it, expect } from "vitest";
import { validatePayload } from "../api/validator.js";
describe("Telemetry Validator", () => {
  it("should accept valid event", () => {
    const payload = {
      framework: "jenjs",
      version: "0.1.0",
      command: "dev",
      os: "win32",
    };
    const result = validatePayload(payload);
    expect(result.valid).toBe(true);
  });
  it("should accept array of events", () => {
    const payload = [
      { framework: "jenjs", version: "0.1.0" },
      { framework: "jenjs", version: "0.1.0", command: "build" },
    ];
    const result = validatePayload(payload);
    expect(result.valid).toBe(true);
  });
  it("should reject missing framework", () => {
    const payload = { version: "0.1.0" };
    const result = validatePayload(payload);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/framework/i);
  });
  it("should reject missing version", () => {
    const payload = { framework: "jenjs" };
    const result = validatePayload(payload);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/version/i);
  });
  it("should reject non-string framework", () => {
    const payload = { framework: 123, version: "0.1.0" };
    const result = validatePayload(payload);
    expect(result.valid).toBe(false);
  });
  it("should reject fields that are too long", () => {
    const payload = {
      framework: "jenjs",
      version: "0.1.0",
      command: "x".repeat(100),
    };
    const result = validatePayload(payload);
    expect(result.valid).toBe(false);
  });
  it("should reject empty event list", () => {
    const payload = [];
    const result = validatePayload(payload);
    expect(result.valid).toBe(false);
  });
  it("should reject too many events", () => {
    const payload = Array(101).fill({
      framework: "jenjs",
      version: "0.1.0",
    });
    const result = validatePayload(payload);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too many/i);
  });
});
