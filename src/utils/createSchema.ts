import { Container } from 'typedi';
import { buildSchema } from 'type-graphql';

/**
 * Creates a GraphQL schema.
 *
 * Sets up the schema using the resolvers in the resolvers directory
 * and adds a typedi container.
 */
export const createSchema = () =>
  buildSchema({
    container: Container,
    resolvers: [`${__dirname}/../resolvers/*.ts`],
  });
