/**
 * Common validation rules for server actions.
 * Can be composed and chained for complex validations.
 */
/**
 * Creates a required field validator.
 * Checks that value is not null, undefined, or empty string.
 */
export function required(message = "This field is required") {
  return {
    name: "required",
    validate: (value) => {
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
export function minLength(min, message) {
  return {
    name: "minLength",
    validate: (value) => {
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
export function maxLength(max, message) {
  return {
    name: "maxLength",
    validate: (value) => {
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
export function email(message = "Invalid email address") {
  return {
    name: "email",
    validate: (value) => {
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
export function url(message = "Invalid URL") {
  return {
    name: "url",
    validate: (value) => {
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
export function pattern(regex, message) {
  return {
    name: "pattern",
    validate: (value) => {
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
export function range(min, max, message) {
  return {
    name: "range",
    validate: (value) => {
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
export function custom(fn, message = "Invalid value") {
  return {
    name: "custom",
    validate: (value) => {
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
export function enumValue(values, message) {
  return {
    name: "enum",
    validate: (value) => {
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
export function type(expectedType, message) {
  return {
    name: "type",
    validate: (value) => {
      if (typeof value !== expectedType) {
        return message || `Expected ${expectedType}`;
      }
      return undefined;
    },
  };
}
