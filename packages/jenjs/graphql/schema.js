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
 * GraphQL schema placeholder module.
 *
 * Jen.js does not include GraphQL as a built-in dependency to keep the framework lightweight.
 * GraphQL support is opt-in: users can integrate GraphQL by installing the graphql package
 * and defining their own schemas in this module or elsewhere in their application.
 *
 * To use GraphQL with Jen.js:
 * 1. Install the graphql package: npm install graphql
 * 2. Define your schema using the graphql library
 * 3. Create API routes that execute queries against the schema
 *
 * @example
 * // Install: npm install graphql
 * // src/graphql/schema.ts
 *
 * import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLField } from 'graphql';
 *
 * export const schema = new GraphQLSchema({
 *   query: new GraphQLObjectType({
 *     name: 'Query',
 *     fields: {
 *       hello: {
 *         type: GraphQLString,
 *         resolve: () => 'Hello, World!'
 *       }
 *     }
 *   })
 * });
 */
/**
 * Placeholder export for the GraphQL schema.
 * Replace with your actual schema once graphql is installed.
 */
export const schema = null;
