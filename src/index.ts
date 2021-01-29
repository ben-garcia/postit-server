import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { Container } from 'typedi';
import { buildSchema } from 'type-graphql';
import express from 'express';
import { createConnection, getRepository } from 'typeorm';

import { User } from './entities';

(async () => {
  // establish the connection to the database.
  await createConnection();

  // Set the User repository as the injected property
  // on the UserService.
  Container.set('userRepository', getRepository(User));

  const app = express();
  // builds the GraphQL schema using the resolver classes.
  const schema = await buildSchema({
    container: Container,
    resolvers: [`${__dirname}/resolvers/*.ts`],
  });
  const server = new ApolloServer({ schema });

  server.applyMiddleware({ app });

  app.listen(4000, () =>
    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
})();
