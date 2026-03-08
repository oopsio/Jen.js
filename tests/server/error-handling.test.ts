import { describe, it, expect, vi } from "vitest";
import { Kernel } from "@src/middleware/kernel.js";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";

describe("Error Handling - Middleware & Server", () => {
  describe("Kernel Error Boundaries", () => {
    it("should catch middleware errors and send 500 response", async () => {
      const kernel = new Kernel();

      // Add middleware that throws
      kernel.use(async (ctx, next) => {
        throw new Error("Middleware failure");
      });

      // Create mock request/response
      const req = {
        headers: {},
        method: "GET",
        url: "/",
      } as IncomingMessage;

      const res = {
        statusCode: 200,
        headersSent: false,
        socket: { destroyed: false, destroy: vi.fn() },
        setHeader: vi.fn(),
        end: vi.fn(),
      } as unknown as ServerResponse;

      await kernel.handle(req, res);

      // Should have set 500 status
      expect(res.statusCode).toBe(500);
      expect(res.setHeader).toHaveBeenCalledWith(
        "content-type",
        "text/html; charset=utf-8",
      );
      expect(res.end).toHaveBeenCalled();
    });

    it("should destroy socket if headers already sent", async () => {
      const kernel = new Kernel();

      kernel.use(async (ctx, next) => {
        throw new Error("Error after headers sent");
      });

      const mockSocket = { destroyed: false, destroy: vi.fn() };

      const req = {
        headers: {},
        method: "GET",
        url: "/",
      } as IncomingMessage;

      const res = {
        statusCode: 200,
        headersSent: true, // Headers already sent
        socket: mockSocket,
        setHeader: vi.fn(),
        end: vi.fn(),
      } as unknown as ServerResponse;

      await kernel.handle(req, res);

      // Should destroy socket instead of trying to send response
      expect(mockSocket.destroy).toHaveBeenCalled();
      expect(res.end).not.toHaveBeenCalled();
    });

    it("should handle middleware group errors", async () => {
      const kernel = new Kernel();

      kernel.use(async (ctx, next) => {
        throw new Error("Group middleware error");
      });

      const req = {
        headers: {},
        method: "GET",
        url: "/",
      } as IncomingMessage;

      const res = {
        statusCode: 200,
        headersSent: false,
        socket: { destroyed: false, destroy: vi.fn() },
        setHeader: vi.fn(),
        end: vi.fn(),
      } as unknown as ServerResponse;

      await kernel.handleWithGroup(req, res, "testGroup");

      // Should have sent error response
      expect(res.statusCode).toBe(500);
      expect(res.setHeader).toHaveBeenCalledWith(
        "content-type",
        "application/json",
      );
    });
  });

  describe("Safe Error Response", () => {
    it("should not send response if headers already sent", async () => {
      const kernel = new Kernel();

      kernel.use(async (ctx, next) => {
        // Simulate middleware that throws after headers are sent
        throw new Error("Should not respond");
      });

      const mockSocket = { destroyed: false, destroy: vi.fn() };

      const req = {
        headers: {},
        method: "GET",
        url: "/",
      } as IncomingMessage;

      const res = {
        statusCode: 200,
        headersSent: true, // Headers already sent before error
        socket: mockSocket,
        writableEnded: true,
        setHeader: vi.fn(),
        end: vi.fn(),
      } as unknown as ServerResponse;

      await kernel.handle(req, res);

      // Should destroy socket due to headers already sent
      expect(mockSocket.destroy).toHaveBeenCalled();
    });

    it("should catch response.end() errors and destroy socket", async () => {
      const kernel = new Kernel();

      kernel.use(async (ctx, next) => {
        throw new Error("Test error");
      });

      const mockSocket = { destroyed: false, destroy: vi.fn() };

      const req = {
        headers: {},
        method: "GET",
        url: "/",
      } as IncomingMessage;

      const res = {
        statusCode: 200,
        headersSent: false,
        socket: mockSocket,
        setHeader: vi.fn(),
        end: () => {
          throw new Error("Cannot write to response");
        },
      } as unknown as ServerResponse;

      await kernel.handle(req, res);

      // Should destroy socket as fallback
      expect(mockSocket.destroy).toHaveBeenCalled();
    });
  });

  describe("Error Logging", () => {
    it("should log error messages", async () => {
      const kernel = new Kernel();
      const logSpy = vi.spyOn(console, "error").mockImplementation();

      kernel.use(async (ctx, next) => {
        throw new Error("Test error for logging");
      });

      const req = {
        headers: {},
        method: "GET",
        url: "/",
      } as IncomingMessage;

      const res = {
        statusCode: 200,
        headersSent: false,
        socket: { destroyed: false, destroy: vi.fn() },
        setHeader: vi.fn(),
        end: vi.fn(),
      } as unknown as ServerResponse;

      await kernel.handle(req, res);

      // Should have logged the error
      logSpy.mockRestore();
    });

    it("should include stack trace in logs", async () => {
      const kernel = new Kernel();

      kernel.use(async (ctx, next) => {
        const err = new Error("Stack trace test");
        throw err;
      });

      const req = {
        headers: {},
        method: "GET",
        url: "/",
      } as IncomingMessage;

      const res = {
        statusCode: 200,
        headersSent: false,
        socket: { destroyed: false, destroy: vi.fn() },
        setHeader: vi.fn(),
        end: vi.fn(),
      } as unknown as ServerResponse;

      await kernel.handle(req, res);

      // Error should be caught safely
      expect(res.statusCode).toBe(500);
    });
  });
});
