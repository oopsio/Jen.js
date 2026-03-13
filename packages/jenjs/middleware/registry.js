/**
 * Global registry for named middleware and middleware groups.
 * Enables reusable middleware composition patterns where middlewares are registered once
 * and then referenced by name in groups or applied globally.
 *
 * The registry follows the singleton pattern to maintain a single shared instance
 * throughout the application lifecycle.
 *
 * @example
 * const registry = MiddlewareRegistry.get();
 * registry.register('auth', authMiddleware);
 * registry.register('logger', loggingMiddleware);
 * registry.group('api', ['auth', 'logger']);
 * // Later, get the group to apply to routes
 * const apiMw = registry.getGroup('api'); // [authMiddleware, loggingMiddleware]
 */
export class MiddlewareRegistry {
    // Singleton instance shared across the application.
    static instance;
    // Map of named middleware functions.
    middleware = new Map();
    // Map of middleware group definitions (groups contain names of registered middleware).
    groups = new Map();
    constructor() { }
    /**
     * Gets or creates the singleton registry instance.
     * All calls to this method return the same instance, ensuring a single registry.
     *
     * @returns The singleton MiddlewareRegistry instance.
     */
    static get() {
        if (!this.instance)
            this.instance = new MiddlewareRegistry();
        return this.instance;
    }
    /**
     * Registers a middleware function with a name.
     * Named middleware can be referenced in groups or applied individually.
     *
     * @param name Unique identifier for the middleware.
     * @param mw The middleware function to register.
     *
     * @example
     * registry.register('cors', corsMiddleware);
     */
    register(name, mw) {
        this.middleware.set(name, mw);
    }
    /**
     * Retrieves a registered middleware by name.
     *
     * @param name The name of the middleware to retrieve.
     * @returns The middleware function, or undefined if not found.
     */
    get(name) {
        return this.middleware.get(name);
    }
    /**
     * Defines a group of middleware by names.
     * Groups allow composing multiple middleware into a named set that can be applied together.
     *
     * @param groupName The name of the group.
     * @param middlewareNames Array of registered middleware names to include in the group.
     *
     * @example
     * registry.group('secure', ['auth', 'rateLimit', 'securityHeaders']);
     */
    group(groupName, middlewareNames) {
        this.groups.set(groupName, middlewareNames);
    }
    /**
     * Retrieves all middleware functions in a named group.
     * Resolves group names to actual middleware functions.
     * Skips missing middleware names gracefully.
     *
     * @param groupName The name of the group to retrieve.
     * @returns Array of middleware functions in the group (in order).
     *
     * @example
     * const middlewares = registry.getGroup('secure'); // [authFn, rateLimitFn, securityHeadersFn]
     */
    getGroup(groupName) {
        const names = this.groups.get(groupName) || [];
        return names.map((n) => this.get(n)).filter((m) => !!m);
    }
}
