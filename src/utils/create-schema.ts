import { Container } from 'typedi';
import { buildSchema } from 'type-graphql';

/**
 * Creates a GraphQL schema.
 *
 * Sets up the schema using the resolvers in the resolvers directory
 * and adds a typedi container.
 */
export const createSchema = () => {
  const resolvers = [
    `${__dirname}/../resolvers/AuthResolver.ts`,
    `${__dirname}/../resolvers/CommunityResolver.ts`,
    `${__dirname}/../resolvers/UserResolver.ts`,
  ];

  // add test resolver when performing 2e2 testing.
  if (process.env.CYPRESS_TEST) {
    resolvers.push(`${__dirname}/../utils/TestResolver.ts`);
  }

  return buildSchema({
    container: Container,
    // @ts-ignore
    resolvers,
  });
};
