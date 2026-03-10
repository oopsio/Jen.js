/**
 * Default security configuration (sensible defaults for production).
 */
export const DEFAULT_SECURITY_CONFIG = {
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
