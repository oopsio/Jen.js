/**
 * Rate limiting middleware
 * Protects against brute force and DDoS attacks
 */
export function rateLimit(options?: {}): (ctx: any, next: any) => Promise<void>;
