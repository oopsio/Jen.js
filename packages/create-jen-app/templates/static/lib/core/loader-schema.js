/**
 * Type-safe loader data schema pattern.
 * Ensures loader return type matches component props type at compile time.
 *
 * @example
 * ```typescript
 * type PageData = { posts: Post[]; count: number };
 *
 * export const loader = defineLoader<PageData>(async (ctx) => {
 *   return {
 *     posts: await fetchPosts(),
 *     count: 42,
 *   };
 * });
 *
 * export default function Page({ data }: { data: PageData }) {
 *   return <div>{data.count} posts</div>;
 * }
 * ```
 */
export function defineLoader(handler) {
  return async (ctx) => {
    const result = handler(ctx);
    return Promise.resolve(result);
  };
}
/**
 * Validates that loader data matches expected schema.
 * Runtime check to catch type mismatches in development.
 *
 * @example
 * ```typescript
 * const data = validateLoaderData(result, { posts: 'array', count: 'number' });
 * ```
 */
export function validateLoaderData(data, schema) {
  if (typeof data !== "object" || data === null) {
    throw new Error(`Expected object, got ${typeof data}`);
  }
  const obj = data;
  for (const [key, type] of Object.entries(schema)) {
    const value = obj[key];
    // Determine actual type (arrays are objects, so treat both as "object")
    let actualType = typeof value;
    if (value === null) {
      actualType = "object"; // null is typeof 'object' in JavaScript
    } else if (Array.isArray(value)) {
      actualType = type === "array" ? "array" : "object";
    }
    if (actualType !== type) {
      throw new Error(
        `Loader data mismatch: expected ${key} to be ${type}, got ${actualType}`,
      );
    }
  }
  return obj;
}
/**
 * Middleware data schema for type-safe middleware → loader flow.
 *
 * @example
 * ```typescript
 * type MiddlewareData = { userId: number; isAdmin: boolean };
 * type PageData = { user: User; canDelete: boolean };
 *
 * export const middleware = defineMiddleware<MiddlewareData>(async (ctx) => {
 *   return { userId: 42, isAdmin: true };
 * });
 *
 * export const loader = defineLoader<PageData>(async (ctx) => {
 *   const { userId, isAdmin } = ctx.data as MiddlewareData;
 *   return { user: await getUser(userId), canDelete: isAdmin };
 * });
 * ```
 */
export function defineMiddleware(handler) {
  return async (ctx) => {
    const result = handler(ctx);
    return Promise.resolve(result);
  };
}
