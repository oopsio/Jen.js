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
