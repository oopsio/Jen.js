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

import type { ValidationRule } from "./types.js";

/**
 * Common validation rules for server actions.
 * Can be composed and chained for complex validations.
 */

/**
 * Creates a required field validator.
 * Checks that value is not null, undefined, or empty string.
 */
export function required(message = "This field is required"): ValidationRule {
  return {
    name: "required",
    validate: (value: any) => {
      if (value === null || value === undefined || value === "") {
        return message;
      }
      return undefined;
    },
  };
}

/**
 * Creates a minimum length validator for strings.
 */
export function minLength(min: number, message?: string): ValidationRule {
  return {
    name: "minLength",
    validate: (value: any) => {
      if (typeof value !== "string") return undefined;
      if (value.length < min) {
        return message || `Minimum ${min} characters required`;
      }
      return undefined;
    },
  };
}

/**
 * Creates a maximum length validator for strings.
 */
export function maxLength(max: number, message?: string): ValidationRule {
  return {
    name: "maxLength",
    validate: (value: any) => {
      if (typeof value !== "string") return undefined;
      if (value.length > max) {
        return message || `Maximum ${max} characters allowed`;
      }
      return undefined;
    },
  };
}

/**
 * Creates an email format validator.
 */
export function email(message = "Invalid email address"): ValidationRule {
  return {
    name: "email",
    validate: (value: any) => {
      if (typeof value !== "string" || !value) return undefined;
      // Simple email regex (RFC 5322 simplified)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return message;
      }
      return undefined;
    },
  };
}

/**
 * Creates a URL format validator.
 */
export function url(message = "Invalid URL"): ValidationRule {
  return {
    name: "url",
    validate: (value: any) => {
      if (typeof value !== "string" || !value) return undefined;
      try {
        new URL(value);
        return undefined;
      } catch {
        return message;
      }
    },
  };
}

/**
 * Creates a regex pattern validator.
 */
export function pattern(regex: RegExp, message?: string): ValidationRule {
  return {
    name: "pattern",
    validate: (value: any) => {
      if (typeof value !== "string" || !value) return undefined;
      if (!regex.test(value)) {
        return message || "Invalid format";
      }
      return undefined;
    },
  };
}

/**
 * Creates a number range validator.
 */
export function range(
  min: number,
  max: number,
  message?: string,
): ValidationRule {
  return {
    name: "range",
    validate: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) return undefined;
      if (num < min || num > max) {
        return message || `Must be between ${min} and ${max}`;
      }
      return undefined;
    },
  };
}

/**
 * Creates a custom validator from a function.
 */
export function custom(
  fn: (value: any) => boolean | string | undefined,
  message = "Invalid value",
): ValidationRule {
  return {
    name: "custom",
    validate: (value: any) => {
      const result = fn(value);
      if (result === false) return message;
      if (typeof result === "string") return result;
      return undefined;
    },
  };
}

/**
 * Creates an enum validator.
 */
export function enumValue(values: any[], message?: string): ValidationRule {
  return {
    name: "enum",
    validate: (value: any) => {
      if (!values.includes(value)) {
        return message || `Must be one of: ${values.join(", ")}`;
      }
      return undefined;
    },
  };
}

/**
 * Creates a type validator.
 */
export function type(expectedType: string, message?: string): ValidationRule {
  return {
    name: "type",
    validate: (value: any) => {
      if (typeof value !== expectedType) {
        return message || `Expected ${expectedType}`;
      }
      return undefined;
    },
  };
}
