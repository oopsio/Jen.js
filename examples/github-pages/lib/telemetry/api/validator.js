/**
 * Telemetry payload validator
 */
const MAX_STRING_LENGTH = 50;
const MAX_EVENTS = 100;
export function validatePayload(payload) {
  // Handle array of events
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return { valid: false, error: "Event array cannot be empty" };
    }
    if (payload.length > MAX_EVENTS) {
      return {
        valid: false,
        error: `Too many events (max ${MAX_EVENTS})`,
      };
    }
    // Validate each event
    for (const event of payload) {
      const result = validateEvent(event);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  }
  // Handle single event
  return validateEvent(payload);
}
function validateEvent(event) {
  if (typeof event !== "object" || event === null) {
    return { valid: false, error: "Event must be an object" };
  }
  const obj = event;
  // Required fields
  if (typeof obj.framework !== "string") {
    return { valid: false, error: "Missing or invalid framework field" };
  }
  if (typeof obj.version !== "string") {
    return { valid: false, error: "Missing or invalid version field" };
  }
  // Validate string lengths
  if (obj.framework.length > MAX_STRING_LENGTH) {
    return {
      valid: false,
      error: `framework exceeds max length of ${MAX_STRING_LENGTH}`,
    };
  }
  if (obj.version.length > MAX_STRING_LENGTH) {
    return {
      valid: false,
      error: `version exceeds max length of ${MAX_STRING_LENGTH}`,
    };
  }
  // Optional string fields
  for (const field of ["command", "os", "error"]) {
    if (field in obj && typeof obj[field] === "string") {
      if (obj[field].length > MAX_STRING_LENGTH) {
        return {
          valid: false,
          error: `${field} exceeds max length of ${MAX_STRING_LENGTH}`,
        };
      }
    }
  }
  return { valid: true };
}
