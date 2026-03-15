import { graphql } from "graphql";
import { schema } from "./schema.js";
import { log } from "../shared/log.js";
/**
 * Execute a GraphQL query against the schema.
 *
 * This function handles query validation, execution, and error reporting.
 * It supports both queries and mutations.
 *
 * @param source The GraphQL query or mutation string.
 * @param variableValues Optional variables for parameterized queries.
 * @param context Optional context object passed to resolvers.
 * @returns Promise resolving to result with data or errors.
 *
 * @example
 * // Execute a simple query
 * const result = await runQuery('{ users { id name email } }');
 *
 * @example
 * // Execute a mutation with variables
 * const result = await runQuery(
 *   'mutation CreateUser($name: String!, $email: String!) { createUser(name: $name, email: $email) { id name email } }',
 *   { name: 'John Doe', email: 'john@example.com' }
 * );
 */
export async function runQuery(source, variableValues, context) {
    try {
        const result = await graphql({
            schema,
            source,
            variableValues: variableValues || {},
            contextValue: context || {},
        });
        if (result.errors && result.errors.length > 0) {
            log.error(`GraphQL execution errors: ${JSON.stringify(result.errors)}`);
        }
        return {
            data: result.data,
            errors: result.errors,
        };
    }
    catch (error) {
        log.error(`GraphQL query execution failed: ${error instanceof Error ? error.message : String(error)}`);
        return {
            errors: [
                {
                    message: error instanceof Error ? error.message : "Unknown error",
                    name: "ExecutionError",
                },
            ],
        };
    }
}
/**
 * Type-safe query builder helper for creating parameterized queries.
 * Useful for preventing injection and ensuring valid query structure.
 *
 * @param queryString The GraphQL query string.
 * @param variables Variables object for the query.
 * @returns Normalized query and variables ready for execution.
 */
export function buildQuery(queryString, variables) {
    return {
        source: queryString.trim(),
        variableValues: variables,
    };
}
/**
 * Execute multiple queries in sequence (not in parallel).
 * Useful for dependent queries or batch operations.
 *
 * @param queries Array of query strings.
 * @param context Optional shared context for all queries.
 * @returns Array of results matching input queries.
 */
export async function runQueries(queries, context) {
    const results = [];
    for (const query of queries) {
        const result = await runQuery(query.source, query.variables, context);
        results.push(result);
    }
    return results;
}
/**
 * Validate a GraphQL query without executing it.
 * Useful for early validation of user-provided queries.
 *
 * @param source The GraphQL query string to validate.
 * @returns Array of validation errors, empty if valid.
 */
export function validateQuery(source) {
    try {
        const { validate, parse } = require("graphql.js");
        const documentAST = parse(source);
        const errors = validate(schema, documentAST);
        return errors;
    }
    catch (error) {
        log.error(`Query validation failed: ${error instanceof Error ? error.message : String(error)}`);
        return [
            {
                message: error instanceof Error ? error.message : "Validation error",
                name: "ValidationError",
            },
        ];
    }
}
// Export schema and resolvers for advanced usage
export { schema } from "./schema.js";
export { resolvers } from "./resolvers.js";
