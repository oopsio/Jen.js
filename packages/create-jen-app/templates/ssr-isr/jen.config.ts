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

const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",
  routes: {
    fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
    routeFilePattern: /^\(([^)]+)\)\.(tsx|jsx|ts|js)$/,
    enableIndexFallback: true,
  },
  rendering: {
    defaultMode: "ssr",
    defaultRevalidateSeconds: 3600,
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

export type RenderMode = "ssg" | "ssr" | "isr";

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
    /** Default rendering strategy: ssg, ssr, or isr */
    defaultMode: RenderMode;

    /**
     * Default revalidation time in seconds (ISR-like behavior).
     * 0 = never revalidate (pure SSR).
     * >0 = revalidate cache after N seconds.
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
