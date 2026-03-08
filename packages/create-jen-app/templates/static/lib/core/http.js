/**
 * Parses the HTTP Cookie header into an object of name-value pairs.
 *
 * Cookie format (RFC 6265):
 * - Multiple cookies separated by semicolons
 * - Each cookie is name=value with optional whitespace
 * - Cookie values are URL-encoded and must be decoded
 *
 * Edge cases handled:
 * - Missing or empty Cookie header returns empty object
 * - Whitespace is trimmed from names and values
 * - Values may contain equals signs (split only on first =)
 * - Empty names or values are filtered out
 * - Values are URL-decoded to handle special characters
 *
 * @param req Node.js IncomingMessage with headers property
 *
 * @returns Object with cookie names as keys and decoded values
 *
 * @example
 * // Header: "sessionId=abc123; theme=dark; path=/admin"
 * // Returns: { sessionId: "abc123", theme: "dark", path: "/admin" }
 *
 * // Header missing or empty
 * // Returns: {}
 */
export function parseCookies(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return {};
  const out = {};
  for (const part of cookie.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    const trimmedName = k.trim();
    const trimmedValue = rest.join("=").trim();
    if (trimmedName && trimmedValue) {
      out[trimmedName] = decodeURIComponent(trimmedValue);
    }
  }
  return out;
}
/**
 * Converts Node.js headers object to a flat string-valued object.
 *
 * Header normalization:
 * - Node.js headers may have array values (for multiple headers with same name)
 * - Arrays are joined with comma-space to follow HTTP spec (RFC 2822)
 * - Non-array string values are kept as-is
 * - Header names are already lowercased by Node.js
 *
 * Motivation:
 * Application code typically expects headers as a flat object with string values,
 * not Node.js's mixed types. This normalizes the data structure for consistency.
 *
 * @param headers The headers object from IncomingMessage.headers
 *
 * @returns Flat object with header names (lowercase) as keys and string values
 *
 * @example
 * // Input (from Node.js):
 * { accept: "text/html", "accept-encoding": ["gzip", "deflate"], "content-type": "application/json" }
 * // Output:
 * { accept: "text/html", "accept-encoding": "gzip, deflate", "content-type": "application/json" }
 */
export function headersToObject(headers) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    if (Array.isArray(v)) out[k] = v.join(", ");
    else if (typeof v === "string") out[k] = v;
  }
  return out;
}
