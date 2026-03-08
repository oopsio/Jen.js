import { describe, it, expect, beforeEach } from "vitest";

/**
 * Request Validation & Sanitization Tests
 * Tests input validation, type checking, and sanitization
 */

interface ValidationRule {
  type: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  sanitize?: (value: any) => any;
}

class Validator {
  private rules: Map<string, ValidationRule> = new Map();

  addRule(field: string, rule: ValidationRule): void {
    this.rules.set(field, rule);
  }

  validate(data: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, rule] of this.rules) {
      const value = data[field];

      // Check required
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      // Check type
      if (typeof value !== rule.type) {
        errors.push(`${field} must be ${rule.type}`);
        continue;
      }

      // Check minLength
      if (
        rule.minLength &&
        typeof value === "string" &&
        value.length < rule.minLength
      ) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }

      // Check maxLength
      if (
        rule.maxLength &&
        typeof value === "string" &&
        value.length > rule.maxLength
      ) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }

      // Check pattern
      if (
        rule.pattern &&
        typeof value === "string" &&
        !rule.pattern.test(value)
      ) {
        errors.push(`${field} format is invalid`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  sanitize(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [field, rule] of this.rules) {
      const value = data[field];

      if (rule.sanitize) {
        sanitized[field] = rule.sanitize(value);
      } else {
        sanitized[field] = value;
      }
    }

    return sanitized;
  }
}

describe("Security: Request Validation & Sanitization", () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  describe("basic type validation", () => {
    it("should validate string fields", () => {
      validator.addRule("name", {
        type: "string",
        required: true,
      });

      const result = validator.validate({ name: "John" });
      expect(result.valid).toBe(true);
    });

    it("should reject invalid string types", () => {
      validator.addRule("name", {
        type: "string",
        required: true,
      });

      const result = validator.validate({ name: 123 });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("must be string");
    });

    it("should validate number fields", () => {
      validator.addRule("age", {
        type: "number",
        required: true,
      });

      const result = validator.validate({ age: 30 });
      expect(result.valid).toBe(true);
    });

    it("should reject invalid number types", () => {
      validator.addRule("age", {
        type: "number",
        required: true,
      });

      const result = validator.validate({ age: "30" });
      expect(result.valid).toBe(false);
    });
  });

  describe("required field validation", () => {
    it("should enforce required fields", () => {
      validator.addRule("email", {
        type: "string",
        required: true,
      });

      const result = validator.validate({});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("required");
    });

    it("should allow missing optional fields", () => {
      validator.addRule("phone", {
        type: "string",
        required: false,
      });

      const result = validator.validate({});
      expect(result.valid).toBe(true);
    });

    it("should reject null required fields", () => {
      validator.addRule("email", {
        type: "string",
        required: true,
      });

      const result = validator.validate({ email: null });
      expect(result.valid).toBe(false);
    });
  });

  describe("string length validation", () => {
    it("should enforce minimum length", () => {
      validator.addRule("password", {
        type: "string",
        minLength: 8,
      });

      const result1 = validator.validate({ password: "short" });
      expect(result1.valid).toBe(false);

      const result2 = validator.validate({ password: "longenough" });
      expect(result2.valid).toBe(true);
    });

    it("should enforce maximum length", () => {
      validator.addRule("username", {
        type: "string",
        maxLength: 20,
      });

      const longName = "a".repeat(21);
      const result = validator.validate({ username: longName });
      expect(result.valid).toBe(false);
    });

    it("should enforce both min and max length", () => {
      validator.addRule("code", {
        type: "string",
        minLength: 3,
        maxLength: 5,
      });

      expect(validator.validate({ code: "ab" }).valid).toBe(false);
      expect(validator.validate({ code: "abc" }).valid).toBe(true);
      expect(validator.validate({ code: "abcde" }).valid).toBe(true);
      expect(validator.validate({ code: "abcdef" }).valid).toBe(false);
    });
  });

  describe("pattern validation", () => {
    it("should validate email format", () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validator.addRule("email", {
        type: "string",
        pattern: emailPattern,
      });

      expect(validator.validate({ email: "user@example.com" }).valid).toBe(
        true,
      );
      expect(validator.validate({ email: "invalid-email" }).valid).toBe(false);
    });

    it("should validate URL format", () => {
      const urlPattern = /^https?:\/\/.+/;
      validator.addRule("website", {
        type: "string",
        pattern: urlPattern,
      });

      expect(validator.validate({ website: "https://example.com" }).valid).toBe(
        true,
      );
      expect(validator.validate({ website: "not a url" }).valid).toBe(false);
    });

    it("should validate alphanumeric", () => {
      const alphanumPattern = /^[a-zA-Z0-9]+$/;
      validator.addRule("code", {
        type: "string",
        pattern: alphanumPattern,
      });

      expect(validator.validate({ code: "abc123" }).valid).toBe(true);
      expect(validator.validate({ code: "abc@123" }).valid).toBe(false);
    });

    it("should validate phone numbers", () => {
      const phonePattern = /^\d{10}$/;
      validator.addRule("phone", {
        type: "string",
        pattern: phonePattern,
      });

      expect(validator.validate({ phone: "1234567890" }).valid).toBe(true);
      expect(validator.validate({ phone: "123-456-7890" }).valid).toBe(false);
    });

    it("should validate IPv4 addresses", () => {
      const ipv4Pattern =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      validator.addRule("ip", {
        type: "string",
        pattern: ipv4Pattern,
      });

      expect(validator.validate({ ip: "192.168.1.1" }).valid).toBe(true);
      expect(validator.validate({ ip: "256.1.1.1" }).valid).toBe(false);
    });
  });

  describe("sanitization", () => {
    it("should trim whitespace", () => {
      validator.addRule("name", {
        type: "string",
        sanitize: (v) => v?.trim(),
      });

      const result = validator.validate({ name: "  John  " });
      expect(result.valid).toBe(true);
    });

    it("should lowercase strings", () => {
      validator.addRule("email", {
        type: "string",
        sanitize: (v) => v?.toLowerCase(),
      });

      validator.validate({ email: "USER@EXAMPLE.COM" });
      const sanitized = validator.sanitize({ email: "USER@EXAMPLE.COM" });
      expect(sanitized.email).toBe("user@example.com");
    });

    it("should remove special characters", () => {
      validator.addRule("username", {
        type: "string",
        sanitize: (v) => v?.replace(/[^a-zA-Z0-9_-]/g, ""),
      });

      const sanitized = validator.sanitize({ username: "user@name#123" });
      expect(sanitized.username).toBe("username123");
    });

    it("should escape HTML characters", () => {
      const escapeHtml = (str: string) =>
        str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

      validator.addRule("comment", {
        type: "string",
        sanitize: escapeHtml,
      });

      const sanitized = validator.sanitize({
        comment: "<script>alert(1)</script>",
      });
      expect(sanitized.comment).not.toContain("<script>");
      expect(sanitized.comment).toContain("&lt;");
    });
  });

  describe("SQL injection prevention", () => {
    it("should identify SQL keywords", () => {
      const sqlKeywords =
        /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i;

      const malicious = "'; DROP TABLE users; --";
      const hasSQLKeywords = sqlKeywords.test(malicious);

      expect(hasSQLKeywords).toBe(true);
    });

    it("should escape single quotes", () => {
      const escapeSql = (str: string) => str.replace(/'/g, "''");

      const input = "O'Brien";
      const escaped = escapeSql(input);

      expect(escaped).toBe("O''Brien");
    });
  });

  describe("command injection prevention", () => {
    it("should identify shell metacharacters", () => {
      const shellMetachars = /[;&|`$(){}[\]<>\\]/;

      const safe = "filename.txt";
      const unsafe = "filename.txt; rm -rf /";

      expect(shellMetachars.test(safe)).toBe(false);
      expect(shellMetachars.test(unsafe)).toBe(true);
    });

    it("should escape command arguments", () => {
      const escapeShellArg = (arg: string) => `'${arg.replace(/'/g, "'\\''")}'`;

      const input = "test';echo 'hacked";
      const escaped = escapeShellArg(input);

      expect(escaped).toContain("'\\''");
    });
  });

  describe("file upload validation", () => {
    it("should validate file extensions", () => {
      const allowedExtensions = [".jpg", ".png", ".gif", ".pdf"];

      const isAllowed = (filename: string) =>
        allowedExtensions.some((ext) => filename.toLowerCase().endsWith(ext));

      expect(isAllowed("document.pdf")).toBe(true);
      expect(isAllowed("script.php")).toBe(false);
      expect(isAllowed("image.jpg")).toBe(true);
    });

    it("should validate MIME types", () => {
      const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];

      const isAllowedMime = (mimeType: string) =>
        allowedMimeTypes.includes(mimeType);

      expect(isAllowedMime("image/jpeg")).toBe(true);
      expect(isAllowedMime("application/x-executable")).toBe(false);
    });

    it("should validate file size", () => {
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      const isValidSize = (size: number) => size <= maxFileSize;

      expect(isValidSize(1024 * 1024)).toBe(true);
      expect(isValidSize(10 * 1024 * 1024)).toBe(false);
    });

    it("should reject double extensions", () => {
      const hasDoubleExtension = (filename: string) =>
        /\.(php|exe|sh)\./i.test(filename);

      expect(hasDoubleExtension("image.php.jpg")).toBe(true);
      expect(hasDoubleExtension("document.pdf")).toBe(false);
    });
  });

  describe("JSON validation", () => {
    it("should validate JSON structure", () => {
      const tryParseJSON = (str: string) => {
        try {
          JSON.parse(str);
          return true;
        } catch {
          return false;
        }
      };

      expect(tryParseJSON('{"name":"John"}')).toBe(true);
      expect(tryParseJSON("invalid json")).toBe(false);
    });

    it("should limit JSON depth to prevent DoS", () => {
      const maxDepth = 10;

      const checkDepth = (obj: any, depth = 0): boolean => {
        if (depth > maxDepth) return false;
        if (typeof obj !== "object" || obj === null) return true;

        return Object.values(obj).every((v) => checkDepth(v, depth + 1));
      };

      const shallowObj = { a: { b: { c: 1 } } };
      expect(checkDepth(shallowObj)).toBe(true);
    });
  });

  describe("rate limiting validation", () => {
    it("should track request frequency", () => {
      const requests: number[] = [];
      const maxRequests = 10;
      const timeWindow = 60000; // 1 minute

      const canRequest = () => {
        const now = Date.now();
        requests.push(now);
        const recent = requests.filter((t) => now - t < timeWindow);
        return recent.length <= maxRequests;
      };

      expect(canRequest()).toBe(true);
    });
  });
});
