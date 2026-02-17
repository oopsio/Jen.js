/**
 * Secure cookie utilities for session management
 * Ensures cookies have proper security flags
 */
export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
    maxAge?: number;
    path?: string;
    domain?: string;
}
/**
 * Generate secure cookie header value
 */
export declare function createSecureCookie(name: string, value: string, options?: CookieOptions): string;
/**
  * Parse cookies from request header
  */
export declare function parseCookies(cookieHeader: string): Record<string, string>;
/**
 * Validate session cookie - check all security properties
 */
export declare function validateSessionCookie(header: string, expectedName?: string): boolean;
