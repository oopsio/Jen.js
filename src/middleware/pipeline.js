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
  static compose(middleware) {
    if (!Array.isArray(middleware))
      throw new TypeError("Middleware stack must be an array!");

    /**
     * Resolve each middleware to a callable function.
     * Handles functions, class constructors, and objects with handle() methods.
     */
    const handlers = middleware.map((mw) => this.resolveMiddleware(mw));

    /**
     * Returns the composed middleware function that executes the pipeline.
     * Uses the dispatch() pattern to enforce single-next-call and maintain order.
     *
     * @param context Request context object passed to each middleware
     * @param next Final handler called after all middlewares
     * @returns Promise that resolves when entire pipeline completes
     */
    return function (context, next) {
      /**
       * Tracks the current dispatch index to detect "next() called multiple times".
       * This prevents middleware from accidentally calling next() twice,
       * which would cause handlers to execute in wrong order.
       */
      let index = -1;

      /**
       * Dispatches (executes) the middleware at index i.
       * Enforces that next() can only be called once by checking index increment.
       *
       * @param i Index of the middleware to execute
       * @returns Promise from the middleware or final next() handler
       */
      function dispatch(i) {
        if (i <= index)
          return Promise.reject(new Error("next() called multiple times"));
        index = i;
        let fn = handlers[i];

        /**
         * If we've exhausted all middlewares, call the final next() handler.
         * This allows code after Pipeline.compose() to run.
         */
        if (i === handlers.length) {
          fn = next;
        }

        if (!fn) return Promise.resolve();

        try {
          /**
           * Execute the middleware function, passing:
           * - context: the request context object
           * - dispatch.bind(null, i + 1): the next() function for chaining
           *
           * Promise.resolve() wraps non-promise returns for consistency.
           */
          return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
        } catch (err) {
          return Promise.reject(err);
        }
      }

      /**
       * Start the pipeline at the first middleware (index 0).
       */
      return dispatch(0);
    };
  }

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
  static resolveMiddleware(mw) {
    if (typeof mw === "function") {
      /**
       * Check if this is a class constructor with a handle() method.
       * Constructors have a prototype property with methods defined on it.
       */
      if (
        "prototype" in mw &&
        mw.prototype &&
        typeof mw.prototype.handle === "function"
      ) {
        try {
          const instance = new mw();
          return instance.handle.bind(instance);
        } catch (e) {
          /**
           * If instantiation fails (constructor requires params),
           * assume it's a simple function middleware and use it directly.
           */
          return mw;
        }
      }
      return mw;
    }

    /**
     * Check for object with handle() method.
     * Useful for class instances or middleware objects.
     */
    if (typeof mw === "object" && mw !== null && "handle" in mw) {
      return mw.handle.bind(mw);
    }

    throw new TypeError(
      "Middleware must be a function, a class constructor, or an object with a handle() method",
    );
  }
}
