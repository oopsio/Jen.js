/**
 * CORS middleware with security defaults
 * Prevents insecure origin sharing with credentials
 */

interface CORSOptions {
  origin?: string | string[] | ((origin: string) => boolean) | "*";
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export function cors(options: CORSOptions = {}) {
  const defaults: CORSOptions = {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // Changed: credentials should be false with CORS by default for security
    maxAge: 86400,
  };
  const opts = { ...defaults, ...options };

  return async (ctx: any, next: () => Promise<void>) => {
    const origin = ctx.req.headers.origin;

    // Validate origin against whitelist
    let allowOrigin = false;
    if (Array.isArray(opts.origin)) {
      allowOrigin = origin && opts.origin.includes(origin);
    } else if (typeof opts.origin === "function") {
      allowOrigin = origin && opts.origin(origin);
    } else if (opts.origin === "*") {
      // DANGEROUS: only use with credentials: false
      if (opts.credentials) {
        console.warn(
          "SECURITY WARNING: CORS origin '*' with credentials=true is insecure. Origin set to empty.",
        );
        allowOrigin = false;
      } else {
        allowOrigin = true;
      }
    } else if (opts.origin === origin) {
      allowOrigin = true;
    }

    if (allowOrigin && origin) {
      ctx.response.header("Access-Control-Allow-Origin", origin);
    }

    if (opts.credentials) {
      ctx.response.header("Access-Control-Allow-Credentials", "true");
    }

    if (ctx.req.method === "OPTIONS") {
      ctx.response.header(
        "Access-Control-Allow-Methods",
        opts.methods?.join(","),
      );
      ctx.response.header(
        "Access-Control-Allow-Headers",
        opts.allowedHeaders?.join(","),
      );
      if (opts.maxAge) {
        ctx.response.header("Access-Control-Max-Age", opts.maxAge);
      }
      ctx.response.status(204).send();
      return;
    }

    await next();
  };
}
