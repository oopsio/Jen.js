interface TelemetryEvent {
  framework?: string;
  version?: string;
  command?: string;
  os?: string;
  [key: string]: unknown;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePayload(payload: unknown): ValidationResult {
  // Must be object or array of objects
  const events = Array.isArray(payload) ? payload : [payload];

  if (events.length === 0) {
    return { valid: false, error: "Empty event list" };
  }

  if (events.length > 100) {
    return { valid: false, error: "Too many events (max 100)" };
  }

  for (const event of events) {
    if (typeof event !== "object" || event === null) {
      return { valid: false, error: "Event must be object" };
    }

    const typed = event as TelemetryEvent;

    // Basic required fields
    if (!typed.framework || typeof typed.framework !== "string") {
      return { valid: false, error: "Missing framework" };
    }

    if (!typed.version || typeof typed.version !== "string") {
      return { valid: false, error: "Missing version" };
    }

    // Validate field lengths
    if (typed.framework.length > 50) {
      return { valid: false, error: "Framework too long" };
    }

    if (typed.version.length > 20) {
      return { valid: false, error: "Version too long" };
    }

    if (typed.command && typeof typed.command !== "string") {
      return { valid: false, error: "Command must be string" };
    }

    if (typed.command && typed.command.length > 50) {
      return { valid: false, error: "Command too long" };
    }

    if (typed.os && typeof typed.os !== "string") {
      return { valid: false, error: "OS must be string" };
    }

    if (typed.os && typed.os.length > 50) {
      return { valid: false, error: "OS too long" };
    }
  }

  return { valid: true };
}
