import { graphql } from 'graphql';
import { schema } from './schema';
import { resolvers } from './resolvers';

export async function runQuery(query: string, variables?: any) {
  return await graphql({
    schema,
    source: query,
    rootValue: resolvers,
    variableValues: variables
  });
}
