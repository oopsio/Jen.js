/**
 * Middleware composition and execution engine.
 * Composes multiple middleware functions into a single callable function.
 * Supports functions, class constructors, and objects with handle() methods.
 *
 * The Pipeline implements the "cascade" or "onion" middleware pattern:
 * - Middlewares are executed sequentially in order
 * - Each middleware receives a next() function to pass control to the next handler
 * - Execution returns through each middleware in reverse order
 * - Early termination is possible by not calling next()
 *
 * @example
 * const middlewares = [
 *   (ctx, next) => { console.log("1 start"); next().then(() => console.log("1 end")); },
 *   (ctx, next) => { console.log("2 start"); next().then(() => console.log("2 end")); },
 * ];
 * // Logs: "1 start", "2 start", "2 end", "1 end" (onion pattern)
 */
export class Pipeline {
    /**
     * Composes an array of middleware into a single callable function.
     * The composed function accepts (context, finalNext) and executes middlewares in sequence.
     *
     * Middleware resolution:
     * - Functions are passed through as-is
     * - Class constructors (functions with prototype.handle) are instantiated and their handle() bound
     * - Objects with handle() methods have handle() bound to them
     *
     * @param middleware Array of middleware to compose
     * @returns Composed function: async (context, next) => Promise<void>
     *
     * @throws {TypeError} If middleware is not an array
     * @throws {TypeError} If a middleware is not a function, class, or object with handle()
     *
     * @example
     * const composed = Pipeline.compose([authMiddleware, loggingMiddleware]);
     * await composed(ctx, () => console.log("done"));
     */
    static compose(middleware: any): (context: any, next: any) => any;
    /**
     * Resolves a middleware to a callable (context, next) => Promise function.
     * Supports three forms:
     * 1. Function: Used directly
     * 2. Class constructor with handle() method: Instantiated and bound
     * 3. Object with handle() method: handle() method is bound
     *
     * @param mw Middleware in one of the above forms
     * @returns Callable (context, next) => Promise function
     *
     * @throws {TypeError} If mw is not a recognized middleware type
     */
    static resolveMiddleware(mw: any): any;
}
