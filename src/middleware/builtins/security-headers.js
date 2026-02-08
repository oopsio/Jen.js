export async function securityHeaders(ctx, next) {
  // Prevent DNS prefetch (privacy)
  ctx.response.header("X-DNS-Prefetch-Control", "off");

  // Clickjacking protection
  ctx.response.header("X-Frame-Options", "DENY"); // Changed from SAMEORIGIN for stronger protection

  // HTTPS enforcement
  ctx.response.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // Prevent opening files in browser (IE)
  ctx.response.header("X-Download-Options", "noopen");

  // MIME type sniffing protection
  ctx.response.header("X-Content-Type-Options", "nosniff");

  // XSS protection (obsolete but still useful for older browsers)
  ctx.response.header("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  ctx.response.header("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy - NEW
  // Adjust directives based on your application needs
  ctx.response.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
  );

  // Permissions Policy (formerly Feature Policy) - NEW
  ctx.response.header(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  );

  await next();
}
