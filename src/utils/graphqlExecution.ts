// source https://github.com/benawad/type-graphql-series/blob/9_tests/src/test-utils/gCall.ts
import { graphql, GraphQLSchema } from 'graphql';
// @ts-ignore - @types/graphql, graphql versions don't match
// eslint-disable-next-line
import Maybe from 'graphql/tsutils/Maybe';

import { createSchema } from './createSchema';

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
}

let schema: GraphQLSchema;

/**
 * The result of GraphQL execution.
 *
 * Run queries and mutations with out the need for a server.
 */
export const graphqlExecution = async ({ source, variableValues }: Options) => {
  if (!schema) {
    schema = await createSchema();
  }
  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {},
  });
};
