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
import { buildSite } from "./dist/src/build/build.js";
import { createTelemetry } from "./dist/src/telemetry/client.js";

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
