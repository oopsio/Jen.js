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
    /**
     * Initializes a ResponseBuilder with the given ServerResponse.
     *
     * @param res The Node.js ServerResponse object to write to.
     */
    constructor(res: any);
    statusCode: number;
    headers: {};
    body: null;
    res: any;
    /**
     * Sets the HTTP status code for the response.
     *
     * @param code The HTTP status code (e.g., 200, 404, 500).
     * @returns This ResponseBuilder instance for method chaining.
     */
    status(code: any): this;
    /**
     * Adds an HTTP response header.
     * Multiple calls with the same key overwrite previous values.
     *
     * @param key The header name.
     * @param value The header value.
     * @returns This ResponseBuilder instance for method chaining.
     */
    header(key: any, value: any): this;
    /**
     * Sets the response body to a JSON-serialized object and sets Content-Type header.
     * Automatically sets Content-Type to application/json.
     *
     * @param data The object to serialize as JSON.
     * @returns This ResponseBuilder instance for method chaining.
     */
    json(data: any): this;
    /**
     * Sets the response body to HTML content and sets Content-Type header.
     * Automatically sets Content-Type to text/html.
     *
     * @param html The HTML string to send.
     * @returns This ResponseBuilder instance for method chaining.
     */
    html(html: any): this;
    /**
     * Sets the response body to plain text and sets Content-Type header.
     * Automatically sets Content-Type to text/plain.
     *
     * @param text The plain text string to send.
     * @returns This ResponseBuilder instance for method chaining.
     */
    text(text: any): this;
    /**
     * Sends the response to the client.
     * Writes the status code, headers, and body to the underlying ServerResponse.
     * Does nothing if the response has already been sent (writableEnded is true).
     *
     * @returns Void. The underlying res.end() return value is not propagated.
     */
    send(): void;
}
