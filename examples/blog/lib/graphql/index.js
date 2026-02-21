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
 * GraphQL integration utilities for Jen.js applications.
 *
 * Jen.js does not include GraphQL as a built-in dependency. This module provides
 * a placeholder for GraphQL query execution and can be extended with custom implementations
 * that use your chosen GraphQL library.
 *
 * To integrate GraphQL:
 * 1. Install: npm install graphql
 * 2. Import the graphql library: import { graphql } from 'graphql';
 * 3. Implement query execution using your schema
 * 4. Use in API routes or loaders
 *
 * @example
 * // In an API route:
 * import { runQuery } from '@src/graphql';
 *
 * export default {
 *   handler: async (ctx) => {
 *     const result = await runQuery(ctx.body.query, ctx.body.variables);
 *     ctx.response.json(result);
 *   }
 * };
 */
/**
 * Execute a GraphQL query.
 * This is a placeholder function that must be implemented with your GraphQL library.
 *
 * @param query The GraphQL query string.
 * @param variables Optional variables object for parameterized queries.
 * @returns The query result object with data and errors (if any).
 * @throws Error indicating GraphQL library must be installed.
 *
 * @example
 * // Once graphql is installed:
 * import { graphql } from 'graphql';
 * import { schema } from './schema';
 *
 * export async function runQuery(query: string, variables?: any) {
 *   const result = await graphql({
 *     schema,
 *     source: query,
 *     variableValues: variables
 *   });
 *   return result;
 * }
 */
export async function runQuery(query, variables) {
    throw new Error("GraphQL implementation requires external library. Install: npm install graphql");
}
