import type { LoaderContext } from "./types.js";

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
export function defineLoader<TData extends Record<string, any>>(
  handler: (ctx: LoaderContext) => Promise<TData> | TData,
): (ctx: LoaderContext) => Promise<TData> {
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
export function validateLoaderData(
  data: unknown,
  schema: Record<string, string>,
): Record<string, any> {
  if (typeof data !== "object" || data === null) {
    throw new Error(`Expected object, got ${typeof data}`);
  }

  const obj = data as Record<string, any>;
  for (const [key, type] of Object.entries(schema)) {
    const value = obj[key];
    // Determine actual type (arrays are objects, so treat both as "object")
    let actualType: string = typeof value;
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
 * Type helper for strongly-typed loader + component.
 * Ensures data flowing from loader → component is type-safe.
 *
 * @example
 * ```typescript
 * type PageProps = TypedPageProps<{ posts: Post[] }>;
 *
 * export default function Page({ data }: PageProps) {
 *   // data.posts is properly typed as Post[]
 *   return <>{data.posts.map(p => <div key={p.id}>{p.title}</div>)}</>;
 * }
 * ```
 */
export type TypedPageProps<TData extends Record<string, any>> = {
  data: TData;
  params: Record<string, string>;
  query: Record<string, string>;
};

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
export function defineMiddleware<TData extends Record<string, any>>(
  handler: (ctx: any) => Promise<TData> | TData,
): (ctx: any) => Promise<TData> {
  return async (ctx) => {
    const result = handler(ctx);
    return Promise.resolve(result);
  };
}

/**
 * Compose loader and middleware data schemas for complete type safety.
 *
 * @example
 * ```typescript
 * type Composed = ComposeDataSchemas<MiddlewareData, PageData>;
 * // Composed = { userId: number; isAdmin: boolean; posts: Post[] }
 * ```
 */
export type ComposeDataSchemas<
  TMiddleware extends Record<string, any>,
  TLoader extends Record<string, any>,
> = TMiddleware & TLoader;
