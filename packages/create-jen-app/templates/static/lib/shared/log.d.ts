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
export declare const log: {
    /**
     * Logs an informational message with timestamp and [INFO] prefix.
     * Used for progress updates, build completion, server startup, etc.
     *
     * @param msg Message to log
     *
     * @example log.info("Server running on port 3000");
     */
    info(msg: string): void;
    /**
     * Logs a warning message with timestamp and [WARN] prefix.
     * Used for non-fatal issues, deprecated usage, or recoverable problems.
     *
     * @param msg Warning message to log
     *
     * @example log.warn("Configuration file not found, using defaults");
     */
    warn(msg: string): void;
    /**
     * Logs an error message with timestamp and [ERROR] prefix.
     * Used for critical failures that require immediate attention.
     *
     * @param msg Error message to log
     *
     * @example log.error("Failed to compile SCSS: syntax error on line 42");
     */
    error(msg: string): void;
};
