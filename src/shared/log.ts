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

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

/**
 * Get current timestamp in ISO 8601 format.
 * Used to prefix all log messages with precise UTC time information for debugging and monitoring.
 *
 * @returns ISO 8601 timestamp string (e.g., "2026-02-19T15:30:45.123Z")
 */
function ts() {
  return new Date().toISOString();
}

/**
 * Structured logging utility for the Jen.js framework.
 * Provides three log levels (info, warn, error) that output to appropriate streams.
 *
 * Usage:
 * - log.info(): Development and progress messages
 * - log.warn(): Warnings and non-fatal issues
 * - log.error(): Critical errors that may require attention
 *
 * Format:
 * All logs include an ISO 8601 timestamp and a level prefix.
 * Example: "[2026-02-19T15:30:45.123Z] [INFO] Building 42 routes"
 *
 * Output:
 * - info() -> console.log (stdout)
 * - warn() -> console.warn (stderr)
 * - error() -> console.error (stderr)
 *
 * This is used throughout the framework for build output, server status, and diagnostics.
 */
export const log = {
  /**
   * Logs an informational message with timestamp and [INFO] prefix.
   * Used for progress updates, build completion, server startup, etc.
   *
   * @param msg Message to log
   *
   * @example log.info("Server running on port 3000");
   */
  info(msg: string) {
    console.log(
      `${colors.dim}[${ts()}]${colors.reset} ${colors.cyan}[INFO]${colors.reset} ${msg}`,
    );
  },

  /**
   * Logs a warning message with timestamp and [WARN] prefix.
   * Used for non-fatal issues, deprecated usage, or recoverable problems.
   *
   * @param msg Warning message to log
   *
   * @example log.warn("Configuration file not found, using defaults");
   */
  warn(msg: string) {
    console.warn(
      `${colors.dim}[${ts()}]${colors.reset} ${colors.yellow}[WARN]${colors.reset} ${msg}`,
    );
  },

  /**
   * Logs an error message with timestamp and [ERROR] prefix.
   * Used for critical failures that require immediate attention.
   *
   * @param msg Error message to log
   *
   * @example log.error("Failed to compile SCSS: syntax error on line 42");
   */
  error(msg: string) {
    console.error(
      `${colors.dim}[${ts()}]${colors.reset} ${colors.red}[ERROR]${colors.reset} ${msg}`,
    );
  },
};
