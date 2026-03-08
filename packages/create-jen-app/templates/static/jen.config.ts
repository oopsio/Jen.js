const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",
  routes: {
    fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
    routeFilePattern: /^\(([^)]+)\)\.(tsx|jsx|ts|js)$/,
    enableIndexFallback: true,
  },
  rendering: {
    defaultMode: "ssg",
    defaultRevalidateSeconds: 0,
  },
  inject: {
    head: [],
    bodyEnd: [],
  },
  css: {
    globalScss: "site/styles/global.scss",
  },
  assets: {
    publicDir: "site/assets",
    cacheControl: "public, max-age=3600",
  },
  server: {
    port: 3001,
    hostname: "localhost",
  },
  dev: {
    liveReload: true,
  },
};

export default config;

export type RenderMode = "ssg" | "ssr";

export interface FrameworkConfig {
  /** Root directory where pages/components live */
  siteDir: string;

  /** Output directory for build artifacts */
  distDir: string;

  routes: {
    /** Allowed extensions for route files */
    fileExtensions: string[];

    /**
     * Pattern for matching route files.
     * Example: (hello).tsx -> "hello"
     */
    routeFilePattern: RegExp;

    /** If true, /about maps to /about/index */
    enableIndexFallback: boolean;
  };

  rendering: {
    /** Default rendering strategy */
    defaultMode: RenderMode;

    /**
     * Default revalidation time in seconds (ISR-like behavior).
     * 0 = never revalidate.
     */
    defaultRevalidateSeconds: number;
  };

  inject: {
    /**
     * HTML strings to inject into <head>.
     * Example: `<meta charset="utf-8">`
     */
    head: string[];

    /**
     * HTML strings injected before </body>.
     * Example: `<script src="/app.js"></script>`
     */
    bodyEnd: string[];
  };

  css: {
    /** Path to global SCSS file loaded into every page */
    globalScss?: string;
  };

  assets: {
    /** Directory for static public assets */
    publicDir: string;

    /** Cache-Control header applied to assets */
    cacheControl?: string;
  };

  server: {
    /** Dev/SSR server port */
    port: number;

    /** Dev/SSR server hostname */
    hostname: string;
  };

  dev: {
    /** Enables live reload / HMR behavior */
    liveReload: boolean;
  };
}
