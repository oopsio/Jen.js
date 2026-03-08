/**
 * Security headers middleware that sets HTTP response headers for defense against common attacks.
 * Implements a comprehensive security policy including:
 * - Clickjacking protection (X-Frame-Options)
 * - MIME type sniffing protection (X-Content-Type-Options)
 * - XSS protection (X-XSS-Protection, Content-Security-Policy)
 * - HTTPS enforcement (Strict-Transport-Security)
 * - Referrer policy (Referrer-Policy)
 * - Feature permissions (Permissions-Policy)
 *
 * CSP is configured permissively to work with most applications.
 * Adjust directives based on your application's needs (inline scripts, external resources, etc.).
 *
 * @returns Middleware function.
 *
 * @example
 * kernel.use(securityHeaders);
 */
export async function securityHeaders(ctx, next) {
  // Prevent DNS prefetch to reduce information leakage about visited sites.
  ctx.response.header("X-DNS-Prefetch-Control", "off");

  // Clickjacking protection. DENY prevents the page from being framed by any site.
  ctx.response.header("X-Frame-Options", "DENY");

  // HTTPS enforcement via HSTS. Tells browsers to always use HTTPS for this domain.
  // max-age: 1 year, includeSubDomains: apply to all subdomains, preload: allow browser preload lists.
  ctx.response.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // Prevent IE from opening files in unexpected applications.
  ctx.response.header("X-Download-Options", "noopen");

  // MIME type sniffing protection. Forces browsers to respect Content-Type header.
  ctx.response.header("X-Content-Type-Options", "nosniff");

  // XSS protection for older browsers that support X-XSS-Protection.
  // Modern browsers use CSP instead, but this provides backward compatibility.
  ctx.response.header("X-XSS-Protection", "1; mode=block");

  // Referrer policy controls how much referrer information is sent to external sites.
  ctx.response.header("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy restricts which scripts, styles, and resources can load.
  // This configuration allows self-origin for scripts and connect, includes unsafe-inline for styles.
  // Adjust directives based on your application's needs (e.g., external CDNs, external APIs).
  ctx.response.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
  );

  // Permissions Policy (formerly Feature Policy) disables access to sensitive browser APIs.
  // Disable: accelerometer, camera, geolocation, microphone, payment, etc.
  ctx.response.header(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  );

  await next();
}
