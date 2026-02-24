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
  return handler;
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
    let actualType = typeof value;
    if (value === null) {
      actualType = "null";
    } else if (type === "array" && Array.isArray(value)) {
      actualType = "array";
    } else if (Array.isArray(value) && type === "object") {
      // Arrays pass object validation (since arrays are objects)
      actualType = "object";
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
  return handler;
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
