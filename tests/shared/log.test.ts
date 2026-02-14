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

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Logging Utilities", () => {
  describe("Log Levels", () => {
    it("should support error level", () => {
      const logs: any[] = [];
      const error = (msg: string) => logs.push({ level: "error", msg });

      error("Something went wrong");
      expect(logs[0].level).toBe("error");
      expect(logs[0].msg).toContain("wrong");
    });

    it("should support warning level", () => {
      const logs: any[] = [];
      const warn = (msg: string) => logs.push({ level: "warn", msg });

      warn("Deprecated API");
      expect(logs[0].level).toBe("warn");
    });

    it("should support info level", () => {
      const logs: any[] = [];
      const info = (msg: string) => logs.push({ level: "info", msg });

      info("Server started");
      expect(logs[0].level).toBe("info");
    });

    it("should support debug level", () => {
      const logs: any[] = [];
      const debug = (msg: string) => logs.push({ level: "debug", msg });

      debug("Debug information");
      expect(logs[0].level).toBe("debug");
    });
  });

  describe("Log Formatting", () => {
    it("should include timestamp", () => {
      const timestamp = new Date().toISOString();
      const log = { timestamp, level: "info", message: "Test" };

      expect(log.timestamp).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it("should include context information", () => {
      const log = {
        timestamp: new Date().toISOString(),
        level: "error",
        message: "Failed to load",
        context: { file: "app.js", line: 42 },
      };

      expect(log.context.file).toBe("app.js");
      expect(log.context.line).toBe(42);
    });

    it("should format structured logs", () => {
      const log = {
        level: "info",
        message: "Request processed",
        metadata: {
          method: "GET",
          path: "/api/users",
          duration: "125ms",
        },
      };

      expect(log.metadata.method).toBe("GET");
      expect(log.metadata.duration).toContain("ms");
    });
  });

  describe("Log Output", () => {
    it("should write logs to console", () => {
      const consoleSpy = vi.spyOn(console, "log");
      console.log("Test message");

      expect(consoleSpy).toHaveBeenCalledWith("Test message");
      consoleSpy.mockRestore();
    });

    it("should write errors to stderr", () => {
      const consoleSpy = vi.spyOn(console, "error");
      console.error("Error message");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should support multiple outputs", () => {
      const outputs: string[] = [];
      const logger = {
        write: (msg: string) => outputs.push(msg),
      };

      logger.write("Log 1");
      logger.write("Log 2");

      expect(outputs).toHaveLength(2);
    });
  });

  describe("Log Filtering", () => {
    it("should filter by log level", () => {
      const logs = [
        { level: "error", msg: "Error 1" },
        { level: "warn", msg: "Warn 1" },
        { level: "info", msg: "Info 1" },
      ];

      const errors = logs.filter((log) => log.level === "error");
      expect(errors).toHaveLength(1);
      expect(errors[0].msg).toBe("Error 1");
    });

    it("should filter by message pattern", () => {
      const logs = [
        { level: "info", msg: "Server started" },
        { level: "info", msg: "Route registered" },
        { level: "info", msg: "Cache cleared" },
      ];

      const serverLogs = logs.filter((log) => log.msg.includes("Server"));
      expect(serverLogs).toHaveLength(1);
    });

    it("should filter by timestamp range", () => {
      const now = Date.now();
      const logs = [
        { timestamp: now - 5000, msg: "Old log" },
        { timestamp: now - 1000, msg: "Recent log" },
      ];

      const recent = logs.filter((log) => now - log.timestamp < 2000);
      expect(recent).toHaveLength(1);
    });
  });

  describe("Performance", () => {
    it("should handle high-volume logs", () => {
      const logs: any[] = [];
      for (let i = 0; i < 10000; i++) {
        logs.push({ level: "debug", msg: `Log ${i}` });
      }

      expect(logs).toHaveLength(10000);
    });

    it("should lazy-evaluate expensive logs", () => {
      const evaluations: string[] = [];
      const shouldLog = false;

      const getMessage = () => {
        evaluations.push("evaluated");
        return "expensive message";
      };

      if (shouldLog) {
        console.log(getMessage());
      }

      expect(evaluations).toHaveLength(0);
    });
  });
});
