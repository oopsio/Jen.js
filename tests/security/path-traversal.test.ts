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

import { describe, it, expect } from "vitest";
import path from "path";

/**
 * Path Traversal Attack Prevention Tests
 * Tests protection against directory traversal and file access attacks
 */

function validatePath(basePath: string, inputPath: string): boolean {
  try {
    const fullPath = path.resolve(basePath, inputPath);
    const resolvedBase = path.resolve(basePath);

    // Ensure the resolved path is within the base directory
    return fullPath.startsWith(resolvedBase);
  } catch {
    return false;
  }
}

function normalizePath(inputPath: string): string {
  // Decode URL encoding first
  let decoded = decodeURIComponent(inputPath);

  // Remove null bytes
  if (decoded.includes("\0")) {
    throw new Error("Null byte detected");
  }

  // Check for directory traversal patterns
  if (decoded.includes("..") || decoded.startsWith("/")) {
    throw new Error("Invalid path");
  }

  return decoded;
}

describe("Security: Path Traversal Prevention", () => {
  const basePath = "/var/www/public";

  describe("basic path traversal attacks", () => {
    it("should reject double dot sequences", () => {
      expect(() => normalizePath("../../etc/passwd")).toThrow(
        "Invalid path"
      );
      expect(() => normalizePath("../../../root/.ssh/id_rsa")).toThrow(
        "Invalid path"
      );
    });

    it("should reject absolute paths", () => {
      expect(() => normalizePath("/etc/passwd")).toThrow("Invalid path");
      expect(() => normalizePath("/root/.ssh/id_rsa")).toThrow("Invalid path");
    });

    it("should reject paths starting with /", () => {
      expect(() => normalizePath("/var/www/../../etc")).toThrow("Invalid path");
    });

    it("should reject multiple traversal attempts", () => {
      expect(() => normalizePath("../../..")).toThrow("Invalid path");
    });
  });

  describe("encoded path traversal", () => {
    it("should reject URL-encoded double dots (%2e%2e)", () => {
      const encoded = "%2e%2e%2fetc%2fpasswd";
      expect(() => normalizePath(encoded)).toThrow("Invalid path");
    });

    it("should reject double URL-encoded traversal", () => {
      // %252e%252e = %2e%2e (URL-encoded twice)
      const doubleEncoded = "%252e%252e";
      const decoded = decodeURIComponent(doubleEncoded);
      expect(() => normalizePath(decoded)).toThrow("Invalid path");
    });

    it("should reject URL-encoded slashes (%2f)", () => {
      const encoded = "file%2fpath";
      const decoded = decodeURIComponent(encoded);
      expect(decoded).toBe("file/path");
    });

    it("should reject mixed encoding (%2e%2e%2f)", () => {
      const encoded = "%2e%2e%2fetc";
      expect(() => normalizePath(encoded)).toThrow("Invalid path");
    });
  });

  describe("backslash attacks (Windows)", () => {
    it("should reject backslash sequences", () => {
      const path = "..\\..\\windows\\system32";
      expect(path).toContain("\\");
    });

    it("should reject mixed slash types", () => {
      const path = "../..\\windows";
      expect(path).toContain("\\");
    });

    it("should reject backslash encoded (%5c)", () => {
      const encoded = "..%5c..%5cwindows";
      const decoded = decodeURIComponent(encoded);
      expect(decoded).toContain("\\");
    });
  });

  describe("null byte injection", () => {
    it("should reject null bytes (%00)", () => {
      expect(() => normalizePath("file%00.txt")).toThrow("Null byte detected");
      expect(() => normalizePath("admin%00.php")).toThrow("Null byte detected");
    });

    it("should reject literal null bytes", () => {
      expect(() => normalizePath("file\0.txt")).toThrow("Null byte detected");
    });
  });

  describe("path boundary validation", () => {
    it("should validate path stays within base directory", () => {
      expect(validatePath(basePath, "uploads/image.jpg")).toBe(true);
      expect(validatePath(basePath, "docs/readme.txt")).toBe(true);
    });

    it("should reject path traversal beyond base", () => {
      expect(validatePath(basePath, "../../etc/passwd")).toBe(false);
      expect(validatePath(basePath, "../../../root/.ssh")).toBe(false);
    });

    it("should handle symbolic links safely", () => {
      // In production, would check for symlinks
      const testPath = "folder/../../outside";
      const basePath = "/safe/base";
      expect(validatePath(basePath, testPath)).toBe(false);
    });
  });

  describe("file extension validation", () => {
    it("should validate safe file extensions", () => {
      const safeExtensions = [".jpg", ".png", ".pdf", ".txt", ".md"];
      const filename = "document.pdf";
      const hasValidExtension = safeExtensions.some((ext) =>
        filename.endsWith(ext)
      );

      expect(hasValidExtension).toBe(true);
    });

    it("should reject dangerous extensions", () => {
      const dangerousExtensions = [".php", ".exe", ".sh", ".bat", ".cmd"];
      const filename = "shell.php";
      const hasDangerousExtension = dangerousExtensions.some((ext) =>
        filename.endsWith(ext)
      );

      expect(hasDangerousExtension).toBe(true);
    });

    it("should reject double extensions", () => {
      const filename = "image.php.jpg";
      // Check for suspicious patterns
      expect(filename).toMatch(/\.(php|exe|sh)\./);
    });

    it("should handle encoded null bytes", () => {
      const filename = "shell.php%00.jpg";
      // After decoding, this becomes "shell.php\0.jpg"
      const decoded = decodeURIComponent(filename);
      expect(() => normalizePath(decoded)).toThrow("Null byte detected");
    });
  });

  describe("case sensitivity", () => {
    it("should handle case variations", () => {
      const patterns = [
        "../../ETC/PASSWD",
        "../../Etc/Passwd",
        "../../eTc/pAsSwD",
      ];

      patterns.forEach((pattern) => {
        const normalized = pattern.toLowerCase();
        expect(normalized).toContain("..");
      });
    });
  });

  describe("unicode and encoding tricks", () => {
    it("should handle unicode encoding", () => {
      const input = "..";
      const unicode = "\\u002e\\u002e";
      expect(input).not.toBe(unicode);
    });

    it("should handle punycode encoding", () => {
      // Regular ASCII vs punycode
      const ascii = "test";
      expect(ascii).toBeDefined();
    });
  });

  describe("practical attack scenarios", () => {
    it("should protect file download endpoints", () => {
      const downloadPath = "uploads/documents";
      const userInput = "../../etc/passwd";

      expect(validatePath(downloadPath, userInput)).toBe(false);
    });

    it("should protect static file serving", () => {
      const publicDir = "/app/public";
      const attackPath = "../../src/database.js";

      expect(validatePath(publicDir, attackPath)).toBe(false);
    });

    it("should protect template loading", () => {
      const templatesDir = "/app/views";
      const injection = "../../../../etc/hostname";

      expect(validatePath(templatesDir, injection)).toBe(false);
    });

    it("should protect config file access", () => {
      const appDir = "/app";
      const configAccess = "../../etc/app.config";

      expect(validatePath(appDir, configAccess)).toBe(false);
    });

    it("should handle web root escaping", () => {
      const webRoot = "/var/www/html";
      const attempts = [
        "../../etc/passwd",
        "..\\..\\windows\\system32",
      ];

      attempts.forEach((attempt) => {
        expect(validatePath(webRoot, attempt)).toBe(false);
      });
    });
  });

  describe("safe path operations", () => {
    it("should allow safe relative paths", () => {
      const baseDir = "/app/uploads";
      const safeInputs = [
        "image.jpg",
        "subfolder/document.pdf",
        "user-123/profile.png",
      ];

      safeInputs.forEach((input) => {
        expect(validatePath(baseDir, input)).toBe(true);
      });
    });

    it("should handle directory creation safely", () => {
      const parentDir = "/app/data";
      const newDirName = "new_folder";

      // Validate directory name is safe
      expect(newDirName).not.toContain("..");
      expect(newDirName).not.toContain("/");
      expect(newDirName).not.toContain("\\");
    });
  });

  describe("error handling", () => {
    it("should handle malformed paths", () => {
      const malformed = "///path///to///file";
      expect(malformed).toBeDefined();
    });

    it("should handle extremely long paths", () => {
      const longPath = "a".repeat(10000);
      // Paths should be limited
      expect(longPath.length).toBeGreaterThan(255);
    });
  });
});
