/**
 * Entry point for static site generation (SSG) build process.
 * This script:
 * 1. Imports the framework configuration from jen.config.js
 * 2. Scans all route files in the configured site directory
 * 3. Pre-renders each route to static HTML at build time
 * 4. Outputs final HTML files to the configured dist directory
 *
 * Used for building static-first applications with no runtime server needed.
 * Useful for SEO, performance, and deployment to CDNs.
 */

// @ts-ignore

import config from "./jen.config.ts";
import { buildSite } from "./src/build/build.js";
import { createTelemetry } from "./src/telemetry/client.js";

// Initialize telemetry
const telemetry = createTelemetry("0.1.0", {
  endpoint: "https://jenjs-telemetry.vercel.app/telemetry",
  disabled: process.env.CI !== "true" && process.env.TELEMETRY_ENABLED !== "1",
});

// Track build-only command
const buildStartTime = Date.now();
telemetry.track({
  command: "build:ssg",
  os: process.platform,
});

try {
  await buildSite({ config });

  // Track successful build
  const duration = Date.now() - buildStartTime;
  telemetry.track({
    command: "build:ssg",
    success: true,
    duration: Math.round(duration / 1000),
    os: process.platform,
  });

  await telemetry.flush();
} catch (err: any) {
  // Track build failure
  const duration = Date.now() - buildStartTime;
  telemetry.track({
    command: "build:ssg",
    success: false,
    duration: Math.round(duration / 1000),
    error: err.message,
    os: process.platform,
  });

  await telemetry.flush();

  throw err;
}
