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
export function securityHeaders(ctx: any, next: any): Promise<void>;
