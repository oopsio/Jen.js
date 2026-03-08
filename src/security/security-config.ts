/**
 * Security headers configuration for Jen.js.
 *
 * Comprehensive configuration for all HTTP security headers,
 * with sensible defaults and full customization options.
 *
 * @example
 * ```typescript
 * // In jen.config.ts
 * security: {
 *   headers: {
 *     csp: {
 *       enabled: true,
 *       directives: {
 *         defaultSrc: ["'self'"],
 *         scriptSrc: ["'self'", "'unsafe-inline'"]
 *       }
 *     },
 *     hsts: { enabled: true, maxAge: 31536000 },
 *     cors: { origins: ["https://example.com"] }
 *   }
 * }
 * ```
 */
export interface SecurityConfig {
  /** Security headers configuration */
  headers?: {
    /** Content Security Policy */
    csp?: CSPConfig;
    /** HTTP Strict Transport Security */
    hsts?: HSTSConfig;
    /** Cross-Origin Resource Sharing */
    cors?: CORSConfig;
    /** X-Frame-Options */
    frameOptions?: FrameOptionsConfig;
    /** X-Content-Type-Options */
    contentTypeOptions?: boolean;
    /** Referrer-Policy */
    referrerPolicy?: ReferrerPolicy;
    /** Permissions-Policy (formerly Feature-Policy) */
    permissionsPolicy?: PermissionsPolicyConfig;
  };

  /** CSRF token configuration */
  csrf?: {
    /** Enable CSRF protection */
    enabled?: boolean;
    /** Cookie name for CSRF token */
    cookieName?: string;
    /** Header name for CSRF token */
    headerName?: string;
  };

  /** Input validation configuration */
  validation?: {
    /** Enable request body validation */
    enabled?: boolean;
    /** Maximum request body size */
    maxBodySize?: number;
  };

  /** Rate limiting configuration */
  rateLimit?: {
    /** Enable rate limiting */
    enabled?: boolean;
    /** Requests per window */
    maxRequests?: number;
    /** Time window in seconds */
    windowSeconds?: number;
    /** Skip rate limiting for certain paths */
    skipPaths?: string[];
  };
}

/**
 * Content Security Policy configuration.
 */
export interface CSPConfig {
  /** Enable CSP header */
  enabled?: boolean;
  /** CSP directives */
  directives?: Record<string, string[]>;
  /** Report-only mode (not enforced) */
  reportOnly?: boolean;
  /** Violation report endpoint */
  reportUri?: string;
}

/**
 * HTTP Strict Transport Security configuration.
 */
export interface HSTSConfig {
  /** Enable HSTS header */
  enabled?: boolean;
  /** Max age in seconds */
  maxAge?: number;
  /** Include subdomains */
  includeSubDomains?: boolean;
  /** Preload directive */
  preload?: boolean;
}

/**
 * Cross-Origin Resource Sharing configuration.
 */
export interface CORSConfig {
  /** Enable CORS */
  enabled?: boolean;
  /** Allowed origins (use '*' for all, or array of specific origins) */
  origins?: string | string[];
  /** Allowed methods */
  methods?: string[];
  /** Allowed headers */
  allowedHeaders?: string[];
  /** Exposed headers */
  exposedHeaders?: string[];
  /** Allow credentials */
  credentials?: boolean;
  /** Max age in seconds */
  maxAge?: number;
}

/**
 * X-Frame-Options configuration.
 */
export interface FrameOptionsConfig {
  /** Enable X-Frame-Options header */
  enabled?: boolean;
  /** Frame options value */
  value?: "DENY" | "SAMEORIGIN" | "ALLOW-FROM";
  /** URI for ALLOW-FROM value */
  uri?: string;
}

/**
 * Referrer-Policy configuration.
 */
export type ReferrerPolicy =
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "same-origin"
  | "origin"
  | "strict-origin"
  | "origin-when-cross-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";

/**
 * Permissions-Policy configuration.
 */
export interface PermissionsPolicyConfig {
  /** Enable Permissions-Policy header */
  enabled?: boolean;
  /** Feature directives */
  directives?: Record<string, PermissionValue>;
}

/**
 * Permission value type.
 */
export type PermissionValue = "*" | "self" | "none" | string[];

/**
 * Default security configuration (sensible defaults for production).
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  headers: {
    csp: {
      enabled: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
      },
      reportOnly: false,
    },
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubDomains: true,
      preload: false,
    },
    cors: {
      enabled: false,
      origins: ["*"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: false,
    },
    frameOptions: {
      enabled: true,
      value: "SAMEORIGIN",
    },
    contentTypeOptions: true,
    referrerPolicy: "strict-origin-when-cross-origin",
    permissionsPolicy: {
      enabled: true,
      directives: {
        geolocation: ["none"],
        microphone: ["none"],
        camera: ["none"],
      },
    },
  },
  csrf: {
    enabled: true,
    cookieName: "__jen_csrf",
    headerName: "X-CSRF-Token",
  },
  validation: {
    enabled: true,
    maxBodySize: 10 * 1024 * 1024, // 10MB
  },
  rateLimit: {
    enabled: false,
    maxRequests: 100,
    windowSeconds: 60,
    skipPaths: ["/health"],
  },
};
