/**
 * Secure cookie utilities for session management
 * Ensures cookies have proper security flags
 */

export interface CookieOptions {
  httpOnly?: boolean; // Prevent JavaScript access
  secure?: boolean; // HTTPS only
  sameSite?: "Strict" | "Lax" | "None";
  maxAge?: number; // In seconds
  path?: string;
  domain?: string;
}

/**
 * Generate secure cookie header value
 */
export function createSecureCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): string {
  const defaults: CookieOptions = {
    httpOnly: true, // Prevent XSS token theft
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "Strict", // CSRF protection
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  };

  const opts = { ...defaults, ...options };
  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (opts.maxAge !== undefined) {
    cookieStr += `; Max-Age=${opts.maxAge}`;
  }
  if (opts.path) {
    cookieStr += `; Path=${opts.path}`;
  }
  if (opts.domain) {
    cookieStr += `; Domain=${opts.domain}`;
  }
  if (opts.secure) {
    cookieStr += "; Secure";
  }
  if (opts.httpOnly) {
    cookieStr += "; HttpOnly";
  }
  if (opts.sameSite) {
    cookieStr += `; SameSite=${opts.sameSite}`;
  }

  return cookieStr;
}

/**
  * Parse cookies from request header
  */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader || !cookieHeader.trim()) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const trimmed = cookie.trim();
    if (!trimmed) return;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;

    const name = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    if (name && value) {
      try {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      } catch (err) {
        // Skip cookies with invalid URI encoding
        console.warn(`Failed to decode cookie ${name}:`, err instanceof Error ? err.message : String(err));
      }
    }
  });

  return cookies;
}

/**
 * Validate session cookie - check all security properties
 */
export function validateSessionCookie(
  header: string,
  expectedName: string = "sessionId",
): boolean {
  if (!header) return false;

  const parts = header.split(";").map((p) => p.trim());
  const [cookiePair, ...flags] = parts;

  if (!cookiePair || !cookiePair.includes("=")) return false;

  const [name] = cookiePair.split("=");
  if (decodeURIComponent(name) !== expectedName) return false;

  // Check required security flags
  const hasHttpOnly = flags.some((f) => f.toLowerCase() === "httponly");
  const hasSameSite = flags.some((f) => f.toLowerCase().startsWith("samesite"));
  const isSecure =
    process.env.NODE_ENV === "production"
      ? flags.some((f) => f.toLowerCase() === "secure")
      : true;

  return hasHttpOnly && hasSameSite && isSecure;
}
