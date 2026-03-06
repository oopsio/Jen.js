/**
 * Class or method decorator for attaching middleware to handlers.
 * Allows declaring middleware dependencies declaratively on class definitions or methods.
 * Middleware is merged with existing middleware if applied multiple times.
 *
 * @param middleware Middleware functions to attach.
 * @returns A decorator function compatible with class or method decoration.
 *
 * @example
 * @UseMiddleware(authMiddleware, corsMiddleware)
 * class UserController {
 *   @UseMiddleware(rateLimitMiddleware)
 *   async getUsers(ctx) { ... }
 * }
 */
export function UseMiddleware(
  ...middleware: any[]
): (target: any, propertyKey: any, descriptor: any) => void;
export const MIDDLEWARE_METADATA_KEY: unique symbol;
