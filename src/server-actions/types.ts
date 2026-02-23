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

import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Validation rule for action input fields.
 * Supports multiple validators chained together.
 */
export interface ValidationRule {
  /**
   * Validator function that checks if a value is valid.
   * Returns undefined if valid, or an error message if invalid.
   */
  validate: (value: any) => string | undefined;

  /**
   * Optional human-readable name for this validator.
   */
  name?: string;
}

/**
 * Validation schema for server action inputs.
 * Maps field names to arrays of validation rules.
 */
export type ValidationSchema = Record<string, ValidationRule[]>;

/**
 * Result of validation process.
 * Contains success flag and field-level error mapping.
 */
export interface ValidationResult {
  /** Whether all validations passed */
  success: boolean;

  /** Map of field names to validation error messages */
  errors: Record<string, string>;
}

/**
 * Streaming response writer for server actions.
 * Allows sending data chunks as server action completes work.
 */
export interface StreamWriter {
  /**
   * Write a data chunk to the response stream.
   * Data is automatically JSON-stringified if an object.
   */
  write(data: any): void;

  /**
   * Write a JSON chunk with metadata.
   */
  writeJSON(data: Record<string, any>): void;

  /**
   * Close the stream.
   */
  close(): void;
}

/**
 * Context object passed to server action handlers.
 * Contains request data, validation utilities, and streaming support.
 */
export interface ServerActionContext {
  /** Node.js IncomingMessage */
  req: IncomingMessage;

  /** Node.js ServerResponse */
  res: ServerResponse;

  /** Full request URL */
  url: URL;

  /** HTTP method in uppercase */
  method: string;

  /** Parsed request body (form data or JSON) */
  body: Record<string, any>;

  /** Query string parameters */
  query: Record<string, string>;

  /** Route parameters (if action is within a parameterized route) */
  params: Record<string, string>;

  /** Request headers */
  headers: Record<string, string>;

  /** Parsed cookies from request */
  cookies: Record<string, string>;

  /** Custom data attached by middleware */
  data?: Record<string, any>;

  /**
   * Validate input against a schema.
   * Returns validation result with any field errors.
   */
  validate(input: any, schema: ValidationSchema): ValidationResult;

  /**
   * Stream response data to client.
   * Enables server action to send multiple chunks as work completes.
   */
  stream(): StreamWriter;
}

/**
 * Server action handler function.
 * Receives context with request data, validation, and streaming support.
 *
 * Return value is automatically serialized:
 * - Response: Sent as-is with status and headers
 * - string: Sent as application/json (JSON-stringified)
 * - object: Sent as application/json
 * - null/undefined: Sent as JSON null
 *
 * For streaming responses, use ctx.stream() and return a streaming result.
 */
export type ServerActionHandler = (
  ctx: ServerActionContext,
) =>
  | Promise<Response | Record<string, any> | string | null | void>
  | Response
  | Record<string, any>
  | string
  | null
  | void;

/**
 * Server action module interface.
 * Exported from "actions" directory as default export.
 *
 * @example
 * ```typescript
 * // site/actions/post-comment.ts
 * import type { ServerAction } from "jenjs";
 *
 * export const metadata = {
 *   name: "postComment",
 *   description: "Submit a new comment"
 * };
 *
 * export const validation = {
 *   text: [
 *     { validate: (v) => !v ? "Required" : undefined },
 *     { validate: (v) => v.length < 10 ? "Min 10 chars" : undefined }
 *   ]
 * };
 *
 * export default async (ctx) => {
 *   const { success, errors } = ctx.validate(ctx.body, validation);
 *   if (!success) return { errors };
 *   // Process action...
 *   return { success: true };
 * };
 * ```
 */
export interface ServerActionModule {
  /**
   * Optional metadata about the action.
   */
  metadata?: {
    /** Human-readable name for the action */
    name?: string;

    /** Description of what the action does */
    description?: string;

    /** Whether action requires authentication */
    requiresAuth?: boolean;

    /** Rate limiting config (requests per second) */
    rateLimit?: number;
  };

  /**
   * Optional validation schema for input data.
   * Applied before handler is called.
   * If validation fails, handler is not executed.
   */
  validation?: ValidationSchema;

  /**
   * Optional middleware to run before action executes.
   * Can be a single middleware or array of middlewares.
   */
  middleware?: any;

  /**
   * The server action handler function.
   * Required export, called with ServerActionContext.
   */
  default: ServerActionHandler;
}

/**
 * Server action result wrapper.
 * Used for streaming and complex responses.
 */
export interface ServerActionResult {
  success: boolean;
  data?: any;
  errors?: Record<string, string>;
  message?: string;
}
