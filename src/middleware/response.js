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
 * Fluent builder for constructing HTTP responses.
 * Provides a chainable API for setting status codes, headers, body, and content type.
 * Delegates actual response sending to the underlying Node.js ServerResponse.
 *
 * This builder is used in the Context to provide convenient response composition
 * without manually managing headers and response state.
 *
 * @example
 * ctx.response
 *   .status(201)
 *   .header('X-Custom', 'value')
 *   .json({ id: 123, name: 'Alice' })
 *   .send();
 */
export class ResponseBuilder {
  // HTTP status code to send (default 200 OK).
  statusCode = 200;

  // Header key-value pairs to include in the response.
  headers = {};

  // Response body content (string, Buffer, or null for empty body).
  body = null;

  // The underlying Node.js ServerResponse object.
  res;

  /**
   * Initializes a ResponseBuilder with the given ServerResponse.
   *
   * @param res The Node.js ServerResponse object to write to.
   */
  constructor(res) {
    this.res = res;
  }

  /**
   * Sets the HTTP status code for the response.
   *
   * @param code The HTTP status code (e.g., 200, 404, 500).
   * @returns This ResponseBuilder instance for method chaining.
   */
  status(code) {
    this.statusCode = code;
    return this;
  }

  /**
   * Adds an HTTP response header.
   * Multiple calls with the same key overwrite previous values.
   *
   * @param key The header name.
   * @param value The header value.
   * @returns This ResponseBuilder instance for method chaining.
   */
  header(key, value) {
    this.headers[key] = value;
    return this;
  }

  /**
   * Sets the response body to a JSON-serialized object and sets Content-Type header.
   * Automatically sets Content-Type to application/json.
   *
   * @param data The object to serialize as JSON.
   * @returns This ResponseBuilder instance for method chaining.
   */
  json(data) {
    this.header("Content-Type", "application/json");
    this.body = JSON.stringify(data);
    return this;
  }

  /**
   * Sets the response body to HTML content and sets Content-Type header.
   * Automatically sets Content-Type to text/html.
   *
   * @param html The HTML string to send.
   * @returns This ResponseBuilder instance for method chaining.
   */
  html(html) {
    this.header("Content-Type", "text/html");
    this.body = html;
    return this;
  }

  /**
   * Sets the response body to plain text and sets Content-Type header.
   * Automatically sets Content-Type to text/plain.
   *
   * @param text The plain text string to send.
   * @returns This ResponseBuilder instance for method chaining.
   */
  text(text) {
    this.header("Content-Type", "text/plain");
    this.body = text;
    return this;
  }

  /**
   * Sends the response to the client.
   * Writes the status code, headers, and body to the underlying ServerResponse.
   * Does nothing if the response has already been sent (writableEnded is true).
   *
   * @returns Void. The underlying res.end() return value is not propagated.
   */
  send() {
    if (this.res.writableEnded) return;
    this.res.writeHead(this.statusCode, this.headers);
    if (this.body !== null && this.body !== undefined) {
      this.res.end(this.body);
    } else {
      this.res.end();
    }
  }
}
